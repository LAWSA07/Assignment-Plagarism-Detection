from sentence_transformers import SentenceTransformer, util
import torch
import numpy as np
from typing import List, Dict, Tuple
import logging

class SimilarityChecker:
    def __init__(self, model_name: str = 'paraphrase-MiniLM-L6-v2'):
        """
        Initialize the similarity checker with a Sentence-BERT model.
        
        Args:
            model_name (str): Name of the pre-trained model to use
        """
        self.model = SentenceTransformer(model_name)
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model.to(self.device)
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Define similarity thresholds
        self.thresholds = {
            'correct': 0.8,
            'partially_correct': 0.5
        }

    def compute_similarity(self, text1: str, text2: str) -> float:
        """
        Compute semantic similarity between two texts.
        
        Args:
            text1 (str): First text
            text2 (str): Second text
            
        Returns:
            float: Similarity score between 0 and 1
        """
        try:
            # Encode texts to get embeddings
            embedding1 = self.model.encode(text1, convert_to_tensor=True)
            embedding2 = self.model.encode(text2, convert_to_tensor=True)
            
            # Compute cosine similarity
            similarity = util.pytorch_cos_sim(embedding1, embedding2)
            
            return float(similarity[0][0])
        except Exception as e:
            self.logger.error(f"Error computing similarity: {str(e)}")
            raise

    def check_answer_correctness(self, student_answer: str, correct_answer: str) -> Dict:
        """
        Check how correct a student's answer is compared to the professor's answer.
        
        Args:
            student_answer (str): Student's submitted answer
            correct_answer (str): Professor's correct answer
            
        Returns:
            dict: Assessment results including similarity score and correctness label
        """
        try:
            similarity_score = self.compute_similarity(student_answer, correct_answer)
            
            # Determine correctness based on thresholds
            if similarity_score >= self.thresholds['correct']:
                correctness = 'Correct'
            elif similarity_score >= self.thresholds['partially_correct']:
                correctness = 'Partially Correct'
            else:
                correctness = 'Incorrect'
            
            return {
                'similarity_score': similarity_score,
                'correctness': correctness,
                'confidence': self._calculate_confidence(similarity_score)
            }
        except Exception as e:
            self.logger.error(f"Error checking answer correctness: {str(e)}")
            return {
                'error': str(e),
                'similarity_score': 0.0,
                'correctness': 'Error',
                'confidence': 0.0
            }

    def batch_check_answers(self, student_answers: List[str], correct_answers: List[str]) -> List[Dict]:
        """
        Check multiple answers in batch for efficiency.
        
        Args:
            student_answers (List[str]): List of student answers
            correct_answers (List[str]): List of corresponding correct answers
            
        Returns:
            List[Dict]: List of assessment results for each answer pair
        """
        try:
            # Encode all texts in batch
            student_embeddings = self.model.encode(student_answers, convert_to_tensor=True)
            correct_embeddings = self.model.encode(correct_answers, convert_to_tensor=True)
            
            # Compute similarities
            similarities = util.pytorch_cos_sim(student_embeddings, correct_embeddings)
            
            results = []
            for i, similarity in enumerate(similarities.diagonal()):
                score = float(similarity)
                if score >= self.thresholds['correct']:
                    correctness = 'Correct'
                elif score >= self.thresholds['partially_correct']:
                    correctness = 'Partially Correct'
                else:
                    correctness = 'Incorrect'
                
                results.append({
                    'similarity_score': score,
                    'correctness': correctness,
                    'confidence': self._calculate_confidence(score)
                })
            
            return results
        except Exception as e:
            self.logger.error(f"Error in batch checking answers: {str(e)}")
            return [{'error': str(e)}] * len(student_answers)

    def _calculate_confidence(self, similarity_score: float) -> float:
        """
        Calculate confidence level based on similarity score.
        
        Args:
            similarity_score (float): Similarity score between 0 and 1
            
        Returns:
            float: Confidence score between 0 and 1
        """
        # Define confidence ranges
        if similarity_score >= self.thresholds['correct']:
            # High confidence for very similar answers
            confidence = 0.9 + (similarity_score - self.thresholds['correct']) * 0.1
        elif similarity_score >= self.thresholds['partially_correct']:
            # Medium confidence for partially correct answers
            confidence = 0.5 + (similarity_score - self.thresholds['partially_correct']) * 0.4
        else:
            # Low confidence for dissimilar answers
            confidence = similarity_score

        return min(1.0, max(0.0, confidence))

    def update_thresholds(self, correct: float = None, partially_correct: float = None):
        """
        Update similarity thresholds for correctness assessment.
        
        Args:
            correct (float): New threshold for "correct" classification
            partially_correct (float): New threshold for "partially correct" classification
        """
        if correct is not None:
            self.thresholds['correct'] = max(0.0, min(1.0, correct))
        if partially_correct is not None:
            self.thresholds['partially_correct'] = max(0.0, min(1.0, partially_correct))
            
        # Ensure thresholds are properly ordered
        if self.thresholds['partially_correct'] > self.thresholds['correct']:
            self.thresholds['partially_correct'] = self.thresholds['correct'] 