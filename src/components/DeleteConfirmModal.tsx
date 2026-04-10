import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { projectService } from '../services/projectService';
import { Project } from '../types/Project.types';
// import { Project, ProjectStatus } from '../types/Project.types';

interface DeleteConfirmModalProps {
  project:   Project;
  onClose:   () => void;
  onDeleted: () => void;
}

export default function DeleteConfirmModal({ project, onClose, onDeleted }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await projectService.delete(project._id);
      onDeleted();
    } catch {
      setError('Failed to delete. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.iconWrap}><AlertTriangle size={28} color="#A32D2D" /></div>
        <h2 style={s.title}>Delete Project?</h2>
        <p style={s.msg}>
          You're about to permanently delete{' '}
          <strong style={{ color: '#1a2e0f' }}>"{project.name}"</strong>.
          This action cannot be undone.
        </p>
        {error && <p style={{ color: '#A32D2D', fontSize: 13, textAlign: 'center' }}>{error}</p>}
        <div style={s.actions}>
          <button type="button" style={s.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" style={s.deleteBtn} onClick={handleDelete} disabled={loading}>
            {loading
              ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
              : <Trash2 size={15} />}
            Delete Project
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 16 },
  modal:     { background: '#fff', borderRadius: 18, padding: '28px 24px 24px', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: "Arial, Helvetica, sans-serif" },
  iconWrap:  { width: 56, height: 56, borderRadius: '50%', background: '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  title:     { margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: '#1a2e0f' },
  msg:       { margin: '0 0 20px', fontSize: 14, color: '#7a9e7a', lineHeight: 1.6 },
  actions:   { display: 'flex', gap: 10, justifyContent: 'center' },
  cancelBtn: { flex: 1, padding: '10px 0', background: '#f4f7f2', color: '#3B6D11', border: 'none', borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
  deleteBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', background: '#A32D2D', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
};