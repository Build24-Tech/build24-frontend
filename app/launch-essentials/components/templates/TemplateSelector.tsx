'use client';

import { getTemplatesByCategory } from '@/lib/template-utils';
import { Template } from '@/types/launch-essentials';
import { useState } from 'react';

interface TemplateSelectorProps {
  category: string;
  onSelect: (template: Template) => void;
}

export default function TemplateSelector({ category, onSelect }: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const templates = getTemplatesByCategory(category);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="template-selector">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="templates-grid">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => onSelect(template)}
            >
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <span className="template-category">{template.category}</span>
            </div>
          ))
        ) : (
          <div className="no-templates">
            <p>No templates found</p>
          </div>
        )}
      </div>
    </div>
  );
}
