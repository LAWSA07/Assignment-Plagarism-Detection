import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const SubmitAssignmentModal = ({ isOpen, onClose, assignment, onSubmissionComplete }) => {
  const [answerFile, setAnswerFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [processingStatus, setProcessingStatus] = useState(null);
  const [processingResults, setProcessingResults] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAnswerFile(file);
    setError('');
    setProcessingStatus(null);
    setProcessingResults(null);
  };

  const checkProcessingStatus = async (submissionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/submissions/${submissionId}/status`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to check processing status');
      }

      const data = await response.json();
      setProcessingStatus(data.processing_status);

      if (data.processing_status === 'Completed') {
        setProcessingResults({
          plagiarismScore: data.plagiarism_score,
          details: data.plagiarism_details
        });
      } else if (data.processing_status === 'Failed') {
        setError(data.processing_error || 'Processing failed');
      } else if (data.processing_status === 'Processing') {
        // Continue checking status
        setTimeout(() => checkProcessingStatus(submissionId), 2000);
      }
    } catch (error) {
      console.error('Error checking processing status:', error);
      setError('Failed to check processing status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setProcessingStatus(null);
    setProcessingResults(null);

    try {
      if (!assignment || !assignment.id) {
        throw new Error('Invalid assignment data');
      }

      if (!answerFile) {
        throw new Error('Please select a file to submit');
      }

      const formData = new FormData();
      formData.append('answerFile', answerFile);

      const response = await fetch(`http://localhost:5000/api/assignments/submit/${assignment.id}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit assignment');
      }

      const submission = await response.json();
      setProcessingStatus(submission.processing_status);

      // Start checking processing status
      if (submission.processing_status === 'Pending' || submission.processing_status === 'Processing') {
        setTimeout(() => checkProcessingStatus(submission.id), 2000);
      }

      onSubmissionComplete(submission);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAnswerFile(null);
      setError('');
      setProcessingStatus(null);
      setProcessingResults(null);
    }
  }, [isOpen]);

  const renderProcessingStatus = () => {
    if (!processingStatus) return null;

    return (
      <div className="processing-status">
        <h4>Processing Status</h4>
        <div className="status-indicator">
          {processingStatus === 'Processing' && (
            <>
              <div className="spinner"></div>
              <p>Processing your submission...</p>
            </>
          )}
          {processingStatus === 'Completed' && (
            <div className="results">
              <p className="success">Processing completed!</p>
              {processingResults && (
                <div className="plagiarism-results">
                  <p>Plagiarism Score: {processingResults.plagiarismScore.toFixed(2)}%</p>
                  {processingResults.plagiarismScore > 30 && (
                    <p className="warning">
                      Warning: High similarity detected with other submissions.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          {processingStatus === 'Failed' && (
            <p className="error">Processing failed: {error}</p>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay minimal-modal-overlay">
      <div className="modal-content minimal-modal-content">
        <div className="modal-header minimal-modal-header">
          <h2 className="modal-title">Submit Assignment</h2>
          <button className="close-button minimal-close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="assignment-details minimal-assignment-details">
          <h3>{assignment.name}</h3>
          <p>{assignment.course}</p>
          {assignment.description && (
            <div className="assignment-description minimal-assignment-description">
              <h4>Description:</h4>
              <p>{assignment.description}</p>
            </div>
          )}
        </div>

        {error && <div className="error-message minimal-error-message">{error}</div>}

        {renderProcessingStatus()}

        <form onSubmit={handleSubmit} className="submit-assignment-form minimal-form">
          <div className="form-group minimal-form-group">
            <label>Upload Your Answer</label>
            <div className="file-upload minimal-file-upload">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                id="answerFile"
                className="minimal-input"
              />
              <label htmlFor="answerFile" className="file-upload-label minimal-btn minimal-btn-cancel" style={{marginTop: 8}}>
                {answerFile ? answerFile.name : 'Choose File'}
              </label>
              <span className="file-format">Supported format: PDF only</span>
            </div>
          </div>

          <div className="modal-actions minimal-modal-actions">
            <button
              type="button"
              className="cancel-btn minimal-btn minimal-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting || processingStatus === 'Processing'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn minimal-btn minimal-btn-primary"
              disabled={isSubmitting || !answerFile || processingStatus === 'Processing'}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitAssignmentModal;