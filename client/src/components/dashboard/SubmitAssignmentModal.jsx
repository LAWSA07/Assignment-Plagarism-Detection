import React, { useState } from 'react';
import { submitAssignment, checkSubmissionStatus } from '../../services/dashboard';
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
      const data = await checkSubmissionStatus(submissionId);
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

      const submission = await submitAssignment(assignment.id, formData);
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Submit Assignment</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="assignment-details">
          <h3>{assignment.name}</h3>
          <p>{assignment.course}</p>
          {assignment.description && (
            <div className="assignment-description">
              <h4>Description:</h4>
              <p>{assignment.description}</p>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {renderProcessingStatus()}

        <form onSubmit={handleSubmit} className="submit-assignment-form">
          <div className="form-group">
            <label>Upload Your Answer</label>
            <div className="file-upload">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                id="answerFile"
              />
              <label htmlFor="answerFile" className="file-upload-label">
                {answerFile ? answerFile.name : 'Choose File'}
              </label>
              <span className="file-format">Supported format: PDF only</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting || processingStatus === 'Processing'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
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