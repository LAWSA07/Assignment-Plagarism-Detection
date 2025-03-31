import React, { useState } from 'react';
import { api } from '../../services/auth';
import './Dashboard.css';

const ALLOWED_FILE_TYPES = ['application/pdf'];
const API_BASE_URL = 'http://localhost:5000';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CreateAssignmentModal = ({ isOpen, onClose, onAssignmentCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    description: '',
    due_date: '',
    question_file: null,
    sections: [] // Array of selected sections
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalId = 'create-assignment-modal';
  const titleId = `${modalId}-title`;

  // Available sections - in a real app, this might come from an API
  const availableSections = [
    { id: 'A', name: 'Section A' },
    { id: 'B', name: 'Section B' },
    { id: 'C', name: 'Section C' },
    { id: 'D', name: 'Section D' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        question_file: file
      }));
      setError('');
    } else {
      setError('Please upload a PDF file');
      e.target.value = '';
    }
  };

  const handleSectionChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      sections: selectedOptions
    }));
  };

  const validateForm = () => {
    if (!formData.name || formData.name.length < 3) {
      setError('Assignment name must be at least 3 characters long');
      return false;
    }

    if (!formData.course) {
      setError('Course name is required');
      return false;
    }

    if (!formData.description || formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }

    if (!formData.due_date) {
      setError('Due date is required');
      return false;
    }

    if (!formData.sections || formData.sections.length === 0) {
      setError('Please select at least one section');
      return false;
    }

    if (!formData.question_file) {
      setError('Please upload a question file');
      return false;
    }

    // Validate file type
    if (formData.question_file && !ALLOWED_FILE_TYPES.includes(formData.question_file.type)) {
      setError(`Invalid file type. Allowed types are: ${ALLOWED_FILE_TYPES.join(', ')}`);
      return false;
    }

    // Validate file size (10MB)
    if (formData.question_file && formData.question_file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/assignments/create', formData);
      onAssignmentCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating assignment:', error);
      setError(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-labelledby={titleId}
      aria-modal="true"
    >
      <div className="modal-content">
        <h2 id={titleId}>Create New Assignment</h2>
        <button
          type="button"
          className="close-button"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <form
          onSubmit={handleSubmit}
          noValidate
          encType="multipart/form-data"
          aria-busy={isSubmitting}
        >
          <div className="form-group">
            <label htmlFor="name">Assignment Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter assignment name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="course">Course</label>
            <input
              type="text"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              placeholder="Enter course name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sections">Sections</label>
            <select
              id="sections"
              name="sections"
              multiple
              value={formData.sections}
              onChange={handleSectionChange}
              className="section-select"
            >
              {availableSections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
            <small className="help-text">Hold Ctrl/Cmd to select multiple sections</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter assignment description"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="datetime-local"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="question_file">Question File (PDF only)</label>
            <input
              type="file"
              id="question_file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cancel assignment creation"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Create assignment"
            >
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;
