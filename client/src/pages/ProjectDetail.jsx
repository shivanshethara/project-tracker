import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

const formatINR = (n) => (n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN'));

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-slate-100">{children}</p>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProject = () => {
    setLoading(true);
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load project'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (data) => {
    setSubmitting(true);
    try {
      const res = await api.put(`/projects/${id}`, data);
      setProject(res.data);
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <p className="text-slate-400">Loading project…</p>;
  if (error)
    return (
      <div>
        <p className="text-red-400">{error}</p>
        <Link to="/projects" className="mt-2 inline-block text-indigo-400 hover:text-indigo-300">
          ← Back to projects
        </Link>
      </div>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <Link to="/projects" className="mb-4 inline-block text-sm text-indigo-400 hover:text-indigo-300">
        ← Back to projects
      </Link>

      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="mt-1 capitalize text-slate-400">{project.category}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-1 flex justify-between text-sm text-slate-400">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Field label="Status">
            <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLES[project.status] || 'bg-slate-600'}`}>
              {project.status}
            </span>
          </Field>
          <Field label="Priority">
            <span className="capitalize">{project.priority}</span>
          </Field>
          <Field label="Budget">{formatINR(project.budget)}</Field>
          <Field label="Progress">{project.progress}%</Field>
        </div>

        <div className="my-6 border-t border-slate-700" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Start Date">{formatDate(project.start_date)}</Field>
          <Field label="Deadline">{formatDate(project.deadline)}</Field>
          <Field label="Created">{formatDate(project.created_at)}</Field>
        </div>

        <div className="my-6 border-t border-slate-700" />

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Description</p>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-slate-200">
            {project.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Project">
        <ProjectForm
          initial={project}
          submitting={submitting}
          onSubmit={handleUpdate}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </motion.div>
  );
}
