import os
import pytesseract
from pdf2image import convert_from_path
from google.cloud import vision
import io
import re
import tempfile
import logging
import datetime

class OCRProcessor:
    def __init__(self, use_cloud_vision=False, google_credentials_path=None):
        """
        Initialize the OCR processor.
        
        Args:
            use_cloud_vision (bool): Whether to use Google Cloud Vision API as fallback
            google_credentials_path (str): Path to Google Cloud credentials JSON file
        """
        self.use_cloud_vision = use_cloud_vision
        if use_cloud_vision and google_credentials_path:
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = google_credentials_path
            self.vision_client = vision.ImageAnnotatorClient()
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def extract_text_from_pdf(self, pdf_path):
        """
        Extract text from a PDF file using Tesseract OCR with Google Cloud Vision as fallback.
        
        Args:
            pdf_path (str): Path to the PDF file
            
        Returns:
            str: Extracted and cleaned text
        """
        try:
            # Convert PDF to images
            with tempfile.TemporaryDirectory() as temp_dir:
                images = convert_from_path(pdf_path, output_folder=temp_dir)
                text_content = []

                for i, image in enumerate(images):
                    # Try Tesseract first
                    try:
                        page_text = pytesseract.image_to_string(image)
                        confidence = self._get_tesseract_confidence(image)
                        
                        # If confidence is low and Cloud Vision is enabled, use it as fallback
                        if confidence < 80 and self.use_cloud_vision:
                            self.logger.info(f"Low Tesseract confidence ({confidence}%), using Cloud Vision for page {i+1}")
                            page_text = self._extract_text_with_cloud_vision(image)
                    except Exception as e:
                        self.logger.error(f"Tesseract failed on page {i+1}: {str(e)}")
                        if self.use_cloud_vision:
                            page_text = self._extract_text_with_cloud_vision(image)
                        else:
                            raise
                    
                    text_content.append(page_text)

                # Combine and clean text
                combined_text = '\n'.join(text_content)
                return self._clean_text(combined_text)

        except Exception as e:
            self.logger.error(f"Error processing PDF: {str(e)}")
            raise

    def _get_tesseract_confidence(self, image):
        """
        Get Tesseract's confidence score for an image.
        
        Args:
            image: PIL Image object
            
        Returns:
            float: Confidence score (0-100)
        """
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        confidences = [int(conf) for conf in data['conf'] if conf != '-1']
        return sum(confidences) / len(confidences) if confidences else 0

    def _extract_text_with_cloud_vision(self, image):
        """
        Extract text using Google Cloud Vision API.
        
        Args:
            image: PIL Image object
            
        Returns:
            str: Extracted text
        """
        if not self.use_cloud_vision:
            raise ValueError("Cloud Vision API is not enabled")

        # Convert PIL Image to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()

        # Create image object
        image = vision.Image(content=img_byte_arr)

        # Perform text detection
        response = self.vision_client.text_detection(image=image)
        if response.error.message:
            raise Exception(
                f"Error from Cloud Vision API: {response.error.message}"
            )

        return response.text_annotations[0].description if response.text_annotations else ""

    def _clean_text(self, text):
        """
        Clean and normalize extracted text.
        
        Args:
            text (str): Raw extracted text
            
        Returns:
            str: Cleaned and normalized text
        """
        # Remove special characters and extra whitespace
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        text = re.sub(r'\s+', ' ', text)
        
        # Normalize text
        text = text.lower().strip()
        
        # Remove multiple periods and normalize sentence endings
        text = re.sub(r'\.{2,}', '.', text)
        text = re.sub(r'([.!?])\s*([a-z])', lambda m: m.group(1) + ' ' + m.group(2).upper(), text)
        
        return text

    def process_submission(self, pdf_path):
        """
        Process a student's PDF submission.
        
        Args:
            pdf_path (str): Path to the PDF file
            
        Returns:
            dict: Processed submission data including extracted text and metadata
        """
        try:
            extracted_text = self.extract_text_from_pdf(pdf_path)
            
            return {
                'text': extracted_text,
                'word_count': len(extracted_text.split()),
                'processed_timestamp': datetime.datetime.now().isoformat(),
                'success': True
            }
        except Exception as e:
            self.logger.error(f"Failed to process submission: {str(e)}")
            return {
                'text': '',
                'error': str(e),
                'success': False
            } 