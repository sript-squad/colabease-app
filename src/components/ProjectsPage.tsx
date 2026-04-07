import { useState, useEffect } from 'react';
import { Plus, Search, Filter, FolderKanban, Loader2 } from 'lucide-react';
import { projectService } from '../services/projectService'
import { Project } from '../types/Project.types';
import ProjectCard from './ProjectsCard';
import ProjectModal from './ProjectsModal';
import DeleteConfirmModal from './DeleteConfirmModal'

const STATUS_FILTERS = [
  { label: 'All',         value: '' },
  { label: 'Planning',    value: 'planning' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'On Hold',     value: 'on_hold' },
  { label: 'Completed',   value: 'completed' },
  { label: 'Cancelled',   value: 'cancelled' },
];

export default function ProjectsPage() {
  const [projects, setProjects]       = useState<Project[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectService.getAll(statusFilter);
      setProjects(res.data);
    } catch {
      setError('Failed to load projects. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [statusFilter]);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.stickyWrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoMark}>
            <FolderKanban size={22} color="#fff" />
          </div>
          <div>
            <h1 style={styles.title}>Projects</h1>
            <p style={styles.subtitle}>{projects.length} total projects</p>
          </div>
        </div>
        <button type="button" style={styles.createBtn} onClick={() => { setEditProject(null); setShowModal(true); }}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={15} color="#7a9e7a" />
          <input
            style={styles.searchInput}
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.filterRow}>
          <Filter size={14} color="#7a9e7a" />
          {STATUS_FILTERS.map((f) => (
            <button
              type="button"
              key={f.value}
              style={{ ...styles.filterChip, ...(statusFilter === f.value ? styles.filterChipActive : {}) }}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.center}>
          <Loader2 size={28} color="#3B6D11" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={styles.mutedText}>Loading projects...</p>
        </div>
      ) : error ? (
        <div style={styles.errorBox}>
          <p style={{ margin: 0, color: '#993C1D' }}>{error}</p>
          <button type="button" style={styles.retryBtn} onClick={fetchProjects}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.center}>
          <FolderKanban size={48} color="#C0DD97" />
          <p style={styles.mutedText}>
            {search ? 'No projects match your search.' : 'No projects yet. Create your first one!'}
          </p>
          {!search && (
            <button type="button" style={styles.createBtn} onClick={() => { setEditProject(null); setShowModal(true); }}>
              <Plus size={15} /> New Project
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={(p: Project) => { setEditProject(p); setShowModal(true); }}
              onDelete={(p: Project) => setDeleteTarget(p)}
            />  
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchProjects(); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          project={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); fetchProjects(); }}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:            { minHeight: '100vh', background: '#f4f7f2', padding: '32px 24px', fontFamily: "Arial, Helvetica, sans-serif" },
  stickyWrapper:   { position: 'sticky', top: 64, zIndex: 10, background: '#f4f7f2', paddingTop: '32px', paddingBottom: '16px', margin: '-32px -24px 24px -24px', paddingLeft: '24px', paddingRight: '24px', borderBottom: '1px solid rgba(0,0,0,0.04)' },
  header:          { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  headerLeft:      { display: 'flex', alignItems: 'center', gap: 14 },
  logoMark:        { width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #3B6D11, #639922)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(59,109,17,0.25)' },
  title:           { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a2e0f', letterSpacing: '-0.3px' },
  subtitle:        { margin: 0, fontSize: 13, color: '#7a9e7a' },
  createBtn:       { display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'linear-gradient(135deg, #3B6D11, #639922)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,109,17,0.3)', fontFamily: 'inherit' },
  toolbar:         { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  searchBox:       { display: 'flex', alignItems: 'center', gap: 8, background: '#f4f7f2', borderRadius: 9, padding: '9px 14px' },
  searchInput:     { border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#1a2e0f', width: '100%', fontFamily: 'inherit' },
  filterRow:       { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  filterChip:      { padding: '5px 13px', borderRadius: 20, border: '1.5px solid #C0DD97', background: 'transparent', color: '#3B6D11', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  filterChipActive:{ background: '#3B6D11', color: '#fff', border: '1.5px solid #3B6D11' },
  grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 },
  center:          { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 8 },
  mutedText:       { color: '#7a9e7a', fontSize: 14, marginTop: 8 },
  errorBox:        { background: '#FAECE7', border: '1px solid #F5C4B3', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  retryBtn:        { padding: '7px 16px', background: '#993C1D', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 13, fontFamily: 'inherit' },
};