import os
import io
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
import threading
from models.submission import Submission
from ml_models.ocr_processor import OCRProcessor
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.ocr = OCRProcessor()  # Assumes env vars for credentials/processor
    
    def process_submission_async(self, submission_id):
        """Start asynchronous processing of a submission"""
        thread = threading.Thread(target=self._process_submission, args=(submission_id,))
        thread.start()
    
    def _process_submission(self, submission_id):
        """Process a submission with text extraction and plagiarism checking"""
        try:
            # Get the submission
            submission = Submission.objects(id=submission_id).first()
            if not submission:
                logger.error(f"Submission {submission_id} not found")
                return
            
            # Update status to Processing
            submission.processing_status = 'Processing'
            submission.save()
            
            # Extract text from PDF
            pdf_data = submission.answer_file.read()
            extracted_text = self._extract_text_from_pdf(pdf_data)
            submission.ocr_text = extracted_text
            
            # Check for plagiarism
            plagiarism_score, plagiarism_details = self._check_plagiarism(submission)
            submission.plagiarism_score = plagiarism_score
            submission.plagiarism_details = plagiarism_details
            
            # Update status to Completed
            submission.processing_status = 'Completed'
            submission.save()
            
            logger.info(f"Successfully processed submission {submission_id}")
            
        except Exception as e:
            logger.error(f"Error processing submission {submission_id}: {str(e)}")
            try:
                submission.processing_status = 'Failed'
                submission.processing_error = str(e)
                submission.save()
            except Exception as save_error:
                logger.error(f"Error updating submission status: {str(save_error)}")
    
    def _extract_text_from_pdf(self, pdf_data):
        """Extract text from PDF using Google Cloud Document AI"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                tmp_file.write(pdf_data)
                tmp_file_path = tmp_file.name
            try:
                text = self.ocr.extract_text_from_pdf(tmp_file_path)
            finally:
                os.remove(tmp_file_path)
            return text
        except Exception as e:
            logger.error(f"Error in PDF text extraction: {str(e)}")
            raise
    
    def _check_plagiarism(self, submission):
        """Check for plagiarism against other submissions"""
        try:
            # Get all other submissions for the same assignment
            other_submissions = Submission.objects(
                assignment=submission.assignment,
                id__ne=submission.id,
                ocr_text__exists=True
            )
            
            if not other_submissions:
                return 0.0, {"message": "No other submissions to compare against"}
            
            # Prepare texts for comparison
            texts = [submission.ocr_text] + [s.ocr_text for s in other_submissions]
            
            # Calculate TF-IDF matrix
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            
            # Calculate similarity scores
            similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
            
            # Calculate overall plagiarism score
            max_similarity = max(similarity_scores) if len(similarity_scores) > 0 else 0
            plagiarism_score = float(max_similarity * 100)
            
            # Prepare detailed results
            details = {
                "overall_score": plagiarism_score,
                "comparisons": [
                    {
                        "submission_id": str(other_submissions[i].id),
                        "similarity_score": float(score * 100)
                    }
                    for i, score in enumerate(similarity_scores)
                ]
            }
            
            return plagiarism_score, details
            
        except Exception as e:
            logger.error(f"Error in plagiarism checking: {str(e)}")
            raise

# Create a global instance
document_processor = DocumentProcessor() 