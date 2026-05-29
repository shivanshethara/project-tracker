import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const formatINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function StatCard({ label, value, accent }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-lg"
    >
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent || 'text-white'}`}>{value}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/stats'), api.get('/projects')])
      .then(([statsRes, projRes]) => {
        setStats(statsRes.data);
        setProjects(projRes.data);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400">Loading dashboard…</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  const statusLabels = Object.keys(stats.statusCounts);
  const categoryLabels = Object.keys(stats.categoryCounts);

  const doughnutData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusLabels.map((s) => stats.statusCounts[s]),
        backgroundColor: ['#64748b', '#6366f1', '#f59e0b', '#10b981', '#a855f7'],
        borderColor: '#1e293b',
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Projects',
        data: categoryLabels.map((c) => stats.categoryCounts[c]),
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#cbd5e1' } } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' }, beginAtZero: true },
    },
  };

  const recent = projects.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={stats.totalProjects} />
        <StatCard label="In Progress" value={stats.statusCounts['in progress'] || 0} accent="text-indigo-400" />
        <StatCard label="Completed" value={stats.statusCounts['completed'] || 0} accent="text-emerald-400" />
        <StatCard label="Total Budget" value={formatINR(stats.totalBudget)} accent="text-amber-400" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
          <h2 className="mb-4 font-semibold">Status Distribution</h2>
          <div className="h-72">
            {statusLabels.length ? (
              <Doughnut data={doughnutData} options={{ ...chartOptions, scales: {} }} />
            ) : (
              <p className="text-slate-400">No data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
          <h2 className="mb-4 font-semibold">Projects per Category</h2>
          <div className="h-72">
            {categoryLabels.length ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <p className="text-slate-400">No data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Recent Projects</h2>
          <Link to="/projects" className="text-sm text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-slate-400">No projects yet. Add one from the Projects page.</p>
        ) : (
          <ul className="divide-y divide-slate-700">
            {recent.map((p) => (
              <li key={p.id} className="py-3">
                <Link to={`/projects/${p.id}`} className="flex items-center justify-between gap-4 hover:text-indigo-300">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-sm text-slate-400">
                      {p.category} · {p.status}
                    </p>
                  </div>
                  <div className="w-40 shrink-0">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${p.progress}%` }} />
                    </div>
                    <p className="mt-1 text-right text-xs text-slate-400">{p.progress}%</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
