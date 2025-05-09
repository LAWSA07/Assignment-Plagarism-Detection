import os
import io
import datetime
from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions
import logging

class OCRProcessor:
    def __init__(self, project_id=None, location="us", processor_id=None, google_credentials_path=None):
        """
        Initialize the OCR processor using Google Cloud Document AI.
        Args:
            project_id (str): Google Cloud project ID
            location (str): Processor location (default: 'us')
            processor_id (str): Document AI processor ID
            google_credentials_path (str): Path to Google Cloud credentials JSON file
        """
        self.project_id = project_id or os.environ.get("GOOGLE_CLOUD_PROJECT")
        self.location = location
        self.processor_id = processor_id or os.environ.get("DOCUMENT_AI_PROCESSOR_ID")
        if google_credentials_path:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = google_credentials_path
        self.logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)

    def extract_text_from_pdf(self, pdf_path):
        """
        Extract text from a PDF file using Google Cloud Document AI.
        Args:
            pdf_path (str): Path to the PDF file
        Returns:
            str: Extracted text
        """
        try:
            # Read the PDF file
            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()

            # Set up Document AI client
            opts = ClientOptions(api_endpoint=f"{self.location}-documentai.googleapis.com")
            client = documentai.DocumentUnderstandingServiceClient(client_options=opts)

            # Build the request
            name = f"projects/{self.project_id}/locations/{self.location}/processors/{self.processor_id}"
            raw_document = documentai.RawDocument(content=pdf_bytes, mime_type="application/pdf")
            request = documentai.ProcessRequest(name=name, raw_document=raw_document)

            # Process the document
            result = client.process_document(request=request)
            document = result.document
            text = document.text or ""
            return text
        except Exception as e:
            self.logger.error(f"Error processing PDF with Document AI: {str(e)}")
            raise

    def process_submission(self, pdf_path):
        """
        Process a student's PDF submission using Document AI.
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