'use client';

import { Template } from '@/types/launch-essentials';
import React, { useState } from 'react';

interface TemplateEditorProps {
  template: Template;
  onSave: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
}

export default function TemplateEditor({ template, onSave, initialData = {} }: TemplateEditorProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    template.fields.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        newErrors[field.id] = `${field.name} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';
    const hasError = !!errors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={hasError ? 'error' : ''}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={hasError ? 'error' : ''}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={hasError ? 'error' : ''}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={hasError ? 'error' : ''}
          >
            <option value="">Select an option</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={field.id}
            checked={!!value}
            onChange={(e) => handleFieldChange(field.id, e.target.checked)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="template-editor">
      <h2>{template.name}</h2>
      <p>{template.description}</p>

      <form onSubmit={handleSubmit}>
        {template.fields.map(field => (
          <div key={field.id} className="form-field">
            <label htmlFor={field.id}>
              {field.name}
              {field.required && <span className="required">*</span>}
            </label>

            {renderField(field)}

            {errors[field.id] && (
              <span className="error-message">{errors[field.id]}</span>
            )}
          </div>
        ))}

        <button type="submit" className="save-button">
          Save Template
        </button>
      </form>
    </div>
  );
}
