import { useState } from 'react';

const CATEGORIES = [
  'machine learning',
  'web app',
  'mobile app',
  'data analytics',
  'research',
  'other',
];
const STATUSES = ['planning', 'in progress', 'on hold', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

const EMPTY = {
  name: '',
  category: 'web app',
  status: 'planning',
  priority: 'medium',
  progress: 0,
  budget: '',
  start_date: '',
  deadline: '',
  description: '',
};

const labelCls = 'mb-1 block text-sm font-medium text-slate-300';
const inputCls =
  'w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-500';

// Single reusable form for both create and edit.
// `initial` pre-fills fields when editing; `onSubmit` receives the form data.
export default function ProjectForm({ initial, onSubmit, onCancel, submitting }) {
  const [formData, setFormData] = useState({ ...EMPTY, ...(initial || {}) });

  const update = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      progress: parseInt(formData.progress, 10) || 0,
      budget: formData.budget === '' ? null : parseInt(formData.budget, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Name *</label>
        <input
          className={inputCls}
          value={formData.name}
          onChange={update('name')}
          required
          placeholder="e.g. AI Research Assistant"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Category *</label>
          <select className={inputCls} value={formData.category} onChange={update('category')} required>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status *</label>
          <select className={inputCls} value={formData.status} onChange={update('status')} required>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Priority *</label>
          <select className={inputCls} value={formData.priority} onChange={update('priority')} required>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Progress (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className={inputCls}
            value={formData.progress}
            onChange={update('progress')}
          />
        </div>
        <div>
          <label className={labelCls}>Budget (₹)</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={formData.budget ?? ''}
            onChange={update('budget')}
            placeholder="optional"
          />
        </div>
        <div>
          <label className={labelCls}>Start date</label>
          <input type="date" className={inputCls} value={formData.start_date || ''} onChange={update('start_date')} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Deadline *</label>
          <input type="date" className={inputCls} value={formData.deadline || ''} onChange={update('deadline')} required />
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          rows="3"
          className={inputCls}
          value={formData.description || ''}
          onChange={update('description')}
          placeholder="optional"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save Project'}
        </button>
      </div>
    </form>
  );
}
