'use client';

import { deleteTemplate, exportTemplate, getTemplatesByCategory } from '@/lib/template-utils';
import { Template } from '@/types/launch-essentials';
import { useState } from 'react';

interface TemplateManagerProps {
  onTemplateSelect: (template: Template) => void;
  onTemplateDelete: (templateId: string) => void;
}

export default function TemplateManager({ onTemplateSelect, onTemplateDelete }: TemplateManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState('validation');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const templates = getTemplatesByCategory(selectedCategory);
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (template: Template) => {
    onTemplateSelect(template);
  };

  const handleDelete = async (templateId: string) => {
    if (deleteConfirm === templateId) {
      await deleteTemplate(templateId);
      onTemplateDelete(templateId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(templateId);
    }
  };

  const handleExport = async (templateId: string) => {
    await exportTemplate(templateId, 'json');
  };

  return (
    <div className="template-manager">
      <div className="manager-header">
        <h2>Template Manager</h2>

        <div className="manager-controls">
          <button onClick={() => setShowCreateForm(true)}>
            Create New Template
          </button>
          <button onClick={() => setShowImportDialog(true)}>
            Import Template
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="category-filter">
          <label htmlFor="category-select">Filter by category</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="validation">Validation</option>
            <option value="definition">Definition</option>
            <option value="technical">Technical</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>

        <div className="search-filter">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="templates-list">
        {filteredTemplates.map(template => (
          <div key={template.id} className="template-item">
            <div className="template-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <span className="template-category">{template.category}</span>
            </div>

            <div className="template-actions">
              <button onClick={() => handleEdit(template)}>
                Edit
              </button>
              <button onClick={() => handleExport(template.id)}>
                Export
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className={deleteConfirm === template.id ? 'confirm-delete' : ''}
              >
                {deleteConfirm === template.id ? 'Confirm Delete' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Template</h3>
            <form>
              <div className="form-field">
                <label htmlFor="template-name">Template Name</label>
                <input type="text" id="template-name" />
              </div>

              <div className="form-field">
                <label htmlFor="template-category">Category</label>
                <select id="template-category">
                  <option value="validation">Validation</option>
                  <option value="definition">Definition</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="template-description">Description</label>
                <textarea id="template-description" />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Import Template</h3>
            <p>Select template file to import</p>

            <div className="import-area">
              <input type="file" accept=".json,.csv" />
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowImportDialog(false)}>
                Cancel
              </button>
              <button>
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Template</h3>
            <p>Are you sure you want to delete this template? This action cannot be undone.</p>

            <div className="modal-actions">
              <button onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
