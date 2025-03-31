import React, { useState } from 'react';
import { submitAssignment } from '../../services/dashboard';
import './Dashboard.css';

const SubmitAssignmentModal = ({ assignment, onClose, onSubmissionComplete }) => {
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError('Please select a PDF file');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to submit');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            console.log('Submitting assignment:', assignment.id);

            await submitAssignment(assignment.id, file);
            console.log('Assignment submitted successfully');

            onSubmissionComplete();
            onClose();
        } catch (error) {
            console.error('Error submitting assignment:', error);
            setError(error.message || 'Failed to submit assignment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Submit Assignment: {assignment.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="file">Upload PDF File:</label>
                        <input
                            type="file"
                            id="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!file || isSubmitting}
                            className="submit-button"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitAssignmentModal;