import React from 'react';
import './Dashboard.css';

const PlagiarismReportModal = ({ isOpen, onClose, submission }) => {
  if (!isOpen || !submission) return null;

  const getSeverityColor = (score) => {
    if (score >= 70) return '#dc3545'; // Red for high similarity
    if (score >= 40) return '#ffc107'; // Yellow for medium similarity
    return '#28a745'; // Green for low similarity
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Plagiarism Report</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="report-content">
          <div className="submission-info">
            <h3>Submission Details</h3>
            <p><strong>Student:</strong> {submission.student_name}</p>
            <p><strong>Assignment:</strong> {submission.assignment_name}</p>
            <p><strong>Submitted:</strong> {formatDate(submission.submitted_at)}</p>
          </div>

          <div className="plagiarism-score">
            <h3>Overall Similarity Score</h3>
            <div 
              className="score-circle"
              style={{
                backgroundColor: getSeverityColor(submission.plagiarism_score),
                color: 'white',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '20px auto'
              }}
            >
              {submission.plagiarism_score ? `${submission.plagiarism_score.toFixed(1)}%` : 'N/A'}
            </div>
            {submission.plagiarism_score >= 40 && (
              <div className="warning-message" style={{ color: '#dc3545', marginTop: '10px' }}>
                ⚠️ High similarity detected. Manual review recommended.
              </div>
            )}
          </div>

          {submission.plagiarism_details?.comparisons && (
            <div className="similarity-details">
              <h3>Detailed Comparison Results</h3>
              <div className="comparison-list">
                {submission.plagiarism_details.comparisons.map((comparison, index) => (
                  <div 
                    key={comparison.submission_id} 
                    className="comparison-item"
                    style={{
                      padding: '10px',
                      margin: '5px 0',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      borderLeft: `4px solid ${getSeverityColor(comparison.similarity_score)}`
                    }}
                  >
                    <div className="comparison-header">
                      <span>Submission #{index + 1}</span>
                      <span 
                        className="similarity-score"
                        style={{ color: getSeverityColor(comparison.similarity_score) }}
                      >
                        {comparison.similarity_score.toFixed(1)}% Similar
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {submission.processing_status === 'Failed' && (
            <div className="error-message" style={{ marginTop: '20px', color: '#dc3545' }}>
              ⚠️ Error processing submission: {submission.processing_error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="close-btn" 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlagiarismReportModal; 