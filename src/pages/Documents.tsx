import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Plus, Search, Filter, ArrowLeft, 
  MoreVertical, Trash2, Edit3, ExternalLink, 
  Layout, Grid, List as ListIcon, FolderOpen,
  ChevronRight, Calendar, User, Clock, Loader2
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { projectService } from '../services/projectService';
import { Document, CreateDocumentDto } from '../types/Document.types';
import { Project } from '../types/Project.types';

// ── Components ──────────────────────────────────────────────────────

const DocumentCard = ({ doc, onClick, onDelete, onEdit, projectName }: { 
  doc: Document, 
  onClick: () => void, 
  onDelete: () => void, 
  onEdit: () => void,
  projectName?: string 
}) => (
  <div style={styles.card} onClick={onClick}>
    <div style={styles.cardHeader}>
      <div style={styles.docIconWrapper}>
        <FileText size={20} color="#3B6D11" />
      </div>
      <div style={styles.cardActions}>
        <button style={styles.iconBtn} onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <Edit3 size={14} />
        </button>
        <button style={{...styles.iconBtn, color: '#993C1D'}} onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
    
    <div style={styles.cardBody}>
      <h3 style={styles.docTitle}>{doc.title}</h3>
      <p style={styles.docSnippet}>{doc.content.substring(0, 80)}{doc.content.length > 80 ? '...' : ''}</p>
    </div>

    <div style={styles.cardFooter}>
      {projectName && (
        <div style={styles.tag}>
          <FolderOpen size={11} sx={{ mr: 4 }} />
          {projectName}
        </div>
      )}
      <div style={styles.timestamp}>
        <Clock size={11} sx={{ mr: 4 }} />
        {new Date(doc.updatedAt).toLocaleDateString()}
      </div>
    </div>
  </div>
);

// ── Main Page ───────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState<Partial<CreateDocumentDto>>({
    title: '', content: '', projectId: '', authorId: 'current-user'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [docsRes, projRes] = await Promise.all([
        documentService.getAll(selectedProjectId || undefined),
        projectService.getAll('')
      ]);
      const activeProjectIds = new Set(projRes.data.map((p: Project) => p._id));
      const userAssignedDocuments = docsRes.data.filter((doc: Document) => activeProjectIds.has(doc.projectId));
      
      setDocuments(userAssignedDocuments);
      setProjects(projRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProjectId]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.content.toLowerCase().includes(search.toLowerCase())
    );
  }, [documents, search]);

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.projectId) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (editingDoc) {
        await documentService.update(editingDoc._id, {
          title: formData.title,
          content: formData.content
        });
      } else {
        await documentService.create(formData as CreateDocumentDto);
      }
      setIsModalOpen(false);
      setEditingDoc(null);
      setFormData({ title: '', content: '', projectId: '', authorId: 'current-user' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save document');
    }
  };

  const getProjectName = (id: string) => projects.find(p => p._id === id)?.name || 'Unknown Project';

  return (
    <div style={styles.page}>
      {/* Header Area */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.mainTitle}>Knowledge Base</h1>
          <p style={styles.subtitle}>{documents.length} project documents</p>
        </div>
        <button style={styles.createBtn} onClick={() => { setEditingDoc(null); setFormData({ title: '', content: '', projectId: selectedProjectId || '', authorId: 'current-user' }); setIsModalOpen(true); }}>
          <Plus size={18} /> New Document
        </button>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <Search size={16} color="#7a9e7a" />
          <input 
            style={styles.searchInput} 
            placeholder="Search documentation..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div style={styles.filterGroup}>
          <div style={styles.filterItem}>
            <FolderOpen size={14} color="#3B6D11" />
            <select 
              style={styles.select} 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          
          <div style={styles.viewToggle}>
            <button style={{...styles.viewBtn, ...(view === 'grid' ? styles.viewBtnActive : {})}} onClick={() => setView('grid')}>
              <Grid size={16} />
            </button>
            <button style={{...styles.viewBtn, ...(view === 'list' ? styles.viewBtnActive : {})}} onClick={() => setView('list')}>
              <Layout size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div style={styles.center}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#3B6D11' }} />
          <p style={styles.muted}>Loading documents...</p>
        </div>
      ) : error ? (
        <div style={styles.errorBox}>{error}</div>
      ) : filteredDocs.length === 0 ? (
        <div style={styles.emptyState}>
          <FileText size={64} color="#C0DD97" />
          <h3>No documents found</h3>
          <p>Get started by creating a new document for your project.</p>
        </div>
      ) : (
        <div style={styles.docGrid}>
          {filteredDocs.map(doc => (
            <DocumentCard 
              key={doc._id} 
              doc={doc} 
              projectName={getProjectName(doc.projectId)}
              onClick={() => { setEditingDoc(doc); setFormData({ title: doc.title, content: doc.content, projectId: doc.projectId }); setIsModalOpen(true); }}
              onDelete={async () => { if(confirm('Are you sure?')) { await documentService.delete(doc._id); fetchData(); } }}
              onEdit={() => { setEditingDoc(doc); setFormData({ title: doc.title, content: doc.content, projectId: doc.projectId }); setIsModalOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>{editingDoc ? 'Edit Document' : 'Create New Document'}</h2>
              <button style={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Title</label>
                <input 
                  style={styles.input} 
                  placeholder="e.g., Technical Specification" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Project</label>
                <select 
                  style={styles.input}
                  value={formData.projectId}
                  onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                  disabled={!!editingDoc}
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Content (Markdown supported)</label>
                <textarea 
                  style={{...styles.input, height: 250, resize: 'none'}} 
                  placeholder="Write your document content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave}>
                {editingDoc ? 'Update' : 'Create'} Document
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '32px 24px', minHeight: '100vh', background: '#f8faf7', fontFamily: "Arial, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  mainTitle: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1a2e0f', letterSpacing: '-0.02em' },
  subtitle: { margin: '4px 0 0 0', fontSize: 14, color: '#7a9e7a' },
  createBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'linear-gradient(135deg, #3B6D11, #639922)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,109,17,0.2)' },
  
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '12px 16px', borderRadius: 14, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', gap: 16 },
  searchWrapper: { display: 'flex', alignItems: 'center', gap: 10, background: '#f4f7f2', padding: '8px 14px', borderRadius: 10, flex: 1 },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 14, width: '100%', color: '#1a2e0f' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: 16 },
  filterItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: '1px solid #e0e8dc', borderRadius: 10 },
  select: { border: 'none', outline: 'none', fontSize: 14, color: '#3B6D11', fontWeight: 600, background: 'transparent', cursor: 'pointer' },
  viewToggle: { display: 'flex', bg: '#f4f7f2', p: 4, borderRadius: 8, border: '1px solid #e0e8dc' },
  viewBtn: { padding: 6, border: 'none', background: 'transparent', color: '#7a9e7a', cursor: 'pointer', display: 'flex', borderRadius: 6 },
  viewBtnActive: { background: '#fff', color: '#3B6D11', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },

  docGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 16, padding: 20, border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: 12 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  docIconWrapper: { width: 40, height: 40, borderRadius: 10, background: '#f0f4ee', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardActions: { display: 'flex', gap: 4 },
  iconBtn: { padding: 6, background: 'transparent', border: 'none', color: '#7a9e7a', cursor: 'pointer', borderRadius: 6 },
  cardBody: { flex: 1 },
  docTitle: { margin: 0, fontSize: 17, fontWeight: 700, color: '#1a2e0f', lineHeight: 1.3 },
  docSnippet: { margin: '8px 0 0 0', fontSize: 13, color: '#5c7a5c', lineHeight: 1.5 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f8faf7' },
  tag: { fontSize: 11, fontWeight: 600, color: '#3B6D11', background: '#eff5ea', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 },
  timestamp: { fontSize: 11, color: '#9cb69c', display: 'flex', alignItems: 'center', gap: 4 },

  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 12 },
  muted: { color: '#7a9e7a', fontSize: 14 },
  emptyState: { textAlign: 'center', padding: '100px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  errorBox: { padding: 16, background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', borderRadius: 12, textAlign: 'center' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', width: '90%', maxWidth: 640, borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.2)', overflow: 'hidden' },
  modalHeader: { padding: '20px 24px', borderBottom: '1px solid #f0f4ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', fontSize: 24, color: '#7a9e7a', cursor: 'pointer' },
  modalBody: { padding: 24, display: 'flex', flexDirection: 'column', gap: 20 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#1a2e0f' },
  input: { padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e0e8dc', fontSize: 14, outline: 'none' },
  modalFooter: { padding: '16px 24px', borderTop: '1px solid #f0f4ee', display: 'flex', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { padding: '10px 20px', background: '#f4f7f2', color: '#3B6D11', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { padding: '10px 24px', background: 'linear-gradient(135deg, #3B6D11, #639922)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' },
};
