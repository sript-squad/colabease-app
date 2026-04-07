import { Calendar, Users, Pencil, Trash2, Clock } from 'lucide-react';
import { Project } from '../types/Project.types';

interface ProjectCardProps {
  project: Project;
  onEdit:   (project: Project) => void;
  onDelete: (project: Project) => void;
  onClick?: (project: Project) => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  planning:    { label: 'Planning',     bg: '#E6F1FB', color: '#185FA5' },
  in_progress: { label: 'In Progress',  bg: '#EAF3DE', color: '#3B6D11' },
  on_hold:     { label: 'On Hold',      bg: '#FAEEDA', color: '#854F0B' },
  completed:   { label: 'Completed',    bg: '#EAF3DE', color: '#085041' },
  cancelled:   { label: 'Cancelled',    bg: '#FCEBEB', color: '#A32D2D' },
};

const AVATAR_COLORS = ['#3B6D11', '#185FA5', '#854F0B', '#993556', '#533AB7'];

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectCard({ project, onEdit, onDelete, onClick }: ProjectCardProps) {
  const status     = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.planning;
  const initials   = project.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const avatarColor = AVATAR_COLORS[project.name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div 
      style={{ ...styles.card, cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } } as React.CSSProperties} 
      onClick={() => onClick && onClick(project)}
    >
      <div style={styles.cardHeader}>
        <div style={{ ...styles.avatar, background: avatarColor }}>{initials}</div>
        <span style={{ ...styles.statusBadge, background: status.bg, color: status.color }}>
          {status.label}
        </span>
      </div>

      <h3 style={styles.name}>{project.name}</h3>
      {project.description && <p style={styles.desc}>{project.description}</p>}

      <div style={styles.metaRow}>
        {project.endDate && (
          <div style={styles.metaItem}><Calendar size={13} color="#7a9e7a" /><span>Due {formatDate(project.endDate)}</span></div>
        )}
        {(project.members?.length ?? 0) > 0 && (
          <div style={styles.metaItem}><Users size={13} color="#7a9e7a" /><span>{project.members!.length} member{project.members!.length !== 1 ? 's' : ''}</span></div>
        )}
        {project.createdAt && (
          <div style={styles.metaItem}><Clock size={13} color="#7a9e7a" /><span>{formatDate(project.createdAt)}</span></div>
        )}
      </div>

      <div style={styles.divider} />

      <div style={styles.actions}>
        <button style={styles.editBtn}   onClick={(e) => { e.stopPropagation(); onEdit(project); }}><Pencil size={13} /> Edit</button>
        <button style={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); onDelete(project); }}><Trash2 size={13} /> Delete</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card:        { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', fontFamily: "Arial, Helvetica, sans-serif" },
  cardHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  avatar:      { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 },
  statusBadge: { padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  name:        { margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1a2e0f' },
  desc:        { margin: '0 0 14px', fontSize: 13, color: '#7a9e7a', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  metaRow:     { display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 14 },
  metaItem:    { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7a9e7a' },
  divider:     { height: 1, background: '#f0f4ee', margin: '4px 0 12px' },
  actions:     { display: 'flex', gap: 8 },
  editBtn:     { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', background: '#EAF3DE', color: '#3B6D11', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  deleteBtn:   { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};