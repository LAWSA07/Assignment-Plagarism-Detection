# Assignment Checking System - ML Models

This directory contains the machine learning models used for processing and analyzing student assignments.

## Components

### 1. OCR Processor (`ocr_processor.py`)
Handles text extraction from PDF submissions using:
- Tesseract OCR (primary)
- Google Cloud Vision API (fallback for low confidence cases)

Features:
- PDF to image conversion
- Text extraction with confidence scoring
- Automatic fallback to Cloud Vision API
- Text cleaning and normalization

### 2. Similarity Checker (`similarity_checker.py`)
Evaluates the correctness of student answers using:
- Sentence-BERT for semantic similarity
- Configurable thresholds for grading

Features:
- Single and batch answer checking
- Confidence scoring
- Adjustable thresholds for different subjects

### 3. Cheating Detector (`cheating_detector.py`)
Identifies potential academic dishonesty using:
- MinHash + LSH for exact copy detection
- TF-IDF + Cosine Similarity for paraphrase detection

Features:
- Efficient exact copy detection
- Paraphrase detection
- Detailed analysis reports
- Configurable similarity thresholds

## Setup Instructions

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install Tesseract OCR:
- Windows: Download installer from https://github.com/UB-Mannheim/tesseract/wiki
- Linux: `sudo apt-get install tesseract-ocr`
- Mac: `brew install tesseract`

3. Set up Google Cloud Vision API (optional):
- Create a Google Cloud project
- Enable the Vision API
- Download credentials JSON
- Set environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"
```

## Usage Examples

### OCR Processing
```python
from ml_models.ocr_processor import OCRProcessor

# Initialize with optional Cloud Vision fallback
ocr = OCRProcessor(use_cloud_vision=True, google_credentials_path='path/to/credentials.json')

# Process a submission
result = ocr.process_submission('path/to/submission.pdf')
if result['success']:
    extracted_text = result['text']
```

### Answer Checking
```python
from ml_models.similarity_checker import SimilarityChecker

# Initialize checker
checker = SimilarityChecker()

# Check single answer
result = checker.check_answer_correctness(
    student_answer="The mitochondria is the powerhouse of the cell",
    correct_answer="Mitochondria are organelles that generate energy for cells"
)

# Batch check multiple answers
results = checker.batch_check_answers(
    student_answers=["answer1", "answer2"],
    correct_answers=["correct1", "correct2"]
)
```

### Cheating Detection
```python
from ml_models.cheating_detector import CheatingDetector

# Initialize detector
detector = CheatingDetector()

# Analyze submissions
submissions = [
    {'id': 1, 'text': 'submission1'},
    {'id': 2, 'text': 'submission2'}
]

analysis = detector.analyze_submissions(submissions)
print(f"Found {analysis['statistics']['suspicious_submissions']} suspicious submissions")
```

## Configuration

### Adjusting Thresholds

#### Similarity Checker
```python
checker = SimilarityChecker()
checker.update_thresholds(
    correct=0.85,  # Higher threshold for "correct" classification
    partially_correct=0.6  # Higher threshold for "partially correct"
)
```

#### Cheating Detector
```python
detector = CheatingDetector()
detector.update_thresholds(
    exact=0.95,  # Higher threshold for exact copy detection
    paraphrase=0.8  # Higher threshold for paraphrase detection
)
```

## Performance Considerations

- OCR processing is CPU-intensive; consider batch processing for multiple submissions
- Sentence-BERT uses GPU if available, significantly improving performance
- LSH makes exact copy detection efficient for large numbers of submissions
- TF-IDF comparison scales quadratically with number of submissions

## Error Handling

All components include comprehensive error handling and logging:
- Detailed error messages
- Fallback mechanisms
- Activity logging
- Performance metrics

## Future Improvements

1. Model fine-tuning:
   - Fine-tune Sentence-BERT on domain-specific data
   - Adjust TF-IDF parameters for better paraphrase detection

2. Performance optimization:
   - Implement caching for frequently accessed embeddings
   - Parallel processing for batch operations

3. Additional features:
   - Support for more file formats
   - Integration with plagiarism databases
   - Machine learning-based threshold optimization 