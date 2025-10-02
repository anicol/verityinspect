import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Finding } from '@/types';

interface AddFindingModalProps {
  inspectionId: number;
  onClose: () => void;
  onSubmit: (data: NewFindingData) => void;
  isSubmitting?: boolean;
}

export interface NewFindingData {
  category: Finding['category'];
  severity: Finding['severity'];
  title: string;
  description: string;
  frame_id?: number | null;
}

const categories: Array<{ value: Finding['category']; label: string }> = [
  { value: 'PPE', label: 'PPE (Personal Protective Equipment)' },
  { value: 'CLEANLINESS', label: 'Cleanliness' },
  { value: 'SAFETY', label: 'Safety' },
  { value: 'FOOD_SAFETY', label: 'Food Safety & Hygiene' },
  { value: 'EQUIPMENT', label: 'Equipment & Maintenance' },
  { value: 'UNIFORM', label: 'Uniform Compliance' },
  { value: 'MENU_BOARD', label: 'Menu Board' },
  { value: 'OPERATIONAL', label: 'Operational Compliance' },
  { value: 'FOOD_QUALITY', label: 'Food Quality & Presentation' },
  { value: 'STAFF_BEHAVIOR', label: 'Staff Behavior' },
  { value: 'OTHER', label: 'Other' },
];

const severities: Array<{ value: Finding['severity']; label: string; description: string }> = [
  { value: 'LOW', label: 'Low', description: 'Minor issue, address when convenient' },
  { value: 'MEDIUM', label: 'Medium', description: 'Should be addressed soon' },
  { value: 'HIGH', label: 'High', description: 'Important, needs attention' },
  { value: 'CRITICAL', label: 'Critical', description: 'Urgent, immediate action required' },
];

export default function AddFindingModal({ inspectionId, onClose, onSubmit, isSubmitting }: AddFindingModalProps) {
  const [formData, setFormData] = useState<NewFindingData>({
    category: 'CLEANLINESS',
    severity: 'MEDIUM',
    title: '',
    description: '',
    frame_id: null,
  });

  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Add Violation You Noticed</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Finding['category'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity *
            </label>
            <div className="space-y-2">
              {severities.map((sev) => (
                <label
                  key={sev.value}
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.severity === sev.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={sev.value}
                    checked={formData.severity === sev.value}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as Finding['severity'] })}
                    className="mt-1 mr-3"
                    disabled={isSubmitting}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{sev.label}</div>
                    <div className="text-sm text-gray-600">{sev.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="e.g., 'Spill on floor near fryer' or 'Employee not wearing hat'"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              placeholder="Describe what you saw, where it was located, and any other relevant details..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Be specific about the location and what action is needed
            </p>
          </div>

          {/* Helper text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Manual findings are automatically marked as confirmed with 100% confidence.
              Use this to add violations the AI missed or couldn't detect.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Violation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
