import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';

const STATUS_STYLES = {
  planning: 'bg-slate-600 text-slate-100',
  'in progress': 'bg-indigo-500 text-white',
  'on hold': 'bg-amber-500 text-slate-900',
  completed: 'bg-emerald-500 text-slate-900',
};

const PRIORITY_STYLES = {
  low: 'text-slate-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null => create mode
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = () => {
    setLoading(true);
    api
      .get('/projects')
      .then((res) => setProjects(res.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/projects/${editing.id}`, data);
      } else {
        await api.post('/projects', data);
      }
      setModalOpen(false);
      setEditing(null);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
        >
          + New Project
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading projects…</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/50 p-12 text-center">
          <p className="text-slate-400">No projects yet. Click “+ New Project” to add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <Link to={`/projects/${p.id}`} className="min-w-0">
                  <h3 className="truncate text-lg font-semibold hover:text-indigo-300">{p.name}</h3>
                  <p className="text-sm capitalize text-slate-400">{p.category}</p>
                </Link>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[p.status] || 'bg-slate-600'}`}>
                  {p.status}
                </span>
              </div>

              <p className={`mb-3 text-xs font-medium uppercase tracking-wide ${PRIORITY_STYLES[p.priority] || ''}`}>
                {p.priority} priority
              </p>

              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>Progress</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <div className="mt-auto flex gap-2 pt-2">
                <Link
                  to={`/projects/${p.id}`}
                  className="flex-1 rounded-lg border border-slate-600 px-3 py-1.5 text-center text-sm text-slate-200 transition-colors hover:bg-slate-700"
                >
                  View
                </Link>
                <button
                  onClick={() => openEdit(p)}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:bg-slate-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Project' : 'New Project'}
      >
        <ProjectForm
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>
    </motion.div>
  );
}
