import { useState, useEffect } from 'react';
import { X, Loader2, FolderKanban, Sparkles, CheckSquare, Square } from 'lucide-react';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { aiService } from '../services/aiService';
import { authService } from '../services/authService';
import { useAuth } from '../auth/authContex';
import { Project, ProjectStatus } from '../types/Project.types';

interface SuggestedTask {
  title: string;
  description: string;
  selected: boolean;
}


interface ProjectModalProps {
  project:  Project | null;
  onClose:  () => void;
  onSaved:  () => void;
}

interface FormState {
  name:        string;
  description: string;
  status:      ProjectStatus;
  startDate:   string;
  endDate:     string;
  members:     string;
  ownerId:     string;
}

const EMPTY: FormState = {
  name: '', description: '', status: 'planning',
  startDate: '', endDate: '', members: '', ownerId: '',
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planning',    label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold',     label: 'On Hold' },
  { value: 'completed',   label: 'Completed' },
  { value: 'cancelled',   label: 'Cancelled' },
];

export default function ProjectModal({ project, onClose, onSaved }: ProjectModalProps) {
  const isEdit = !!project;
  const { user } = useAuth();
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof FormState | 'submit', string>>>({});
  
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);


  useEffect(() => {
    if (project) {
      setForm({
        name:        project.name ?? '',
        description: project.description ?? '',
        status:      project.status ?? 'planning',
        startDate:   project.startDate?.slice(0, 10) ?? '',
        endDate:     project.endDate?.slice(0, 10) ?? '',
        members:     project.members?.join(', ') ?? '',
        ownerId:     project.ownerId ?? '',
      });
    } else {
      setForm({ ...EMPTY, ownerId: user?.email || '' });
    }
  }, [project, user]);

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim())    e.name    = 'Project name is required';
    if (!form.ownerId.trim()) e.ownerId = 'Owner email is required';
    if (form.endDate && form.startDate && form.endDate < form.startDate)
      e.endDate = 'End date must be after start date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerateTasks = async () => {
    if (!form.name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Please enter a project name first to generate tasks.' }));
      return;
    }
    try {
      setGeneratingTasks(true);
      const res = await aiService.suggestTasks(form.name, form.description);
      const tasks = res.data.tasks.map((t: any) => ({ ...t, selected: true }));
      setSuggestedTasks(tasks);
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, submit: 'Failed to generate AI tasks. Please try again later.' }));
    } finally {
      setGeneratingTasks(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Validate members before submitting
      const memberEmails = form.members ? form.members.split(',').map((m) => m.trim()).filter(Boolean) : [];
      for (const email of memberEmails) {
        const check = await authService.checkUser(email);
        if (!check.data.exists) {
          setErrors({ submit: `User "${email}" not found. Only registered users can be added as members.` });
          setLoading(false);
          return;
        }
      }

      const payload = {
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        status:      form.status,
        ownerId:     form.ownerId.trim(),
        startDate:   form.startDate || undefined,
        endDate:     form.endDate   || undefined,
        members:     memberEmails,
      };

      let createdProjectId = project?._id;
      
      if (isEdit) {
        await projectService.update(project!._id, payload);
      } else {
        const res = await projectService.create(payload);
        createdProjectId = res.data._id;
      }
      
      if (createdProjectId) {
        const selectedTasks = suggestedTasks.filter(t => t.selected);
        for (const t of selectedTasks) {
          try {
            await taskService.create({
              title: t.title,
              description: t.description,
              projectId: createdProjectId,
              reporterId: form.ownerId || 'current-user',
              priority: 'MEDIUM',
              status: 'OPEN',
            });
          } catch (e) {
            console.error('Failed to create AI task:', t.title);
          }
        }
      }
      
      onSaved();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setErrors({ submit: Array.isArray(msg) ? msg.join(', ') : msg ?? 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.mHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={s.mIcon}><FolderKanban size={18} color="#3B6D11" /></div>
            <h2 style={s.mTitle}>{isEdit ? 'Edit Project' : 'New Project'}</h2>
          </div>
          <button type="button" style={s.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Form */}
        <div style={s.form}>
          {errors.submit && <div style={s.submitErr}>{errors.submit}</div>}

          <Field label="Project Name" required error={errors.name}>
            <input style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }}
              placeholder="e.g. E-commerce Platform"
              value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>

          <Field label="Description">
            <textarea style={{ ...s.input, ...s.textarea }}
              placeholder="Brief description..."
              value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
          </Field>

          <div style={s.aiSection}>
            <div style={s.aiHeader}>
              <h3 style={s.aiTitle}><Sparkles size={16} color="#3B6D11" /> AI Task Suggestions</h3>
              <button 
                type="button" 
                style={s.aiBtn} 
                onClick={handleGenerateTasks} 
                disabled={generatingTasks || !form.name.trim()}
              >
                {generatingTasks ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Generate Tasks'}
              </button>
            </div>
            
            {suggestedTasks.length > 0 && (
              <div style={s.aiTaskList}>
                {suggestedTasks.map((t, idx) => (
                  <div 
                    key={idx} 
                    style={{...s.aiTaskItem, ...(t.selected ? s.aiTaskSelected : {})}}
                    onClick={() => {
                      const newT = [...suggestedTasks];
                      newT[idx].selected = !newT[idx].selected;
                      setSuggestedTasks(newT);
                    }}
                  >
                    <div style={s.aiTaskCheckbox}>
                      {t.selected ? <CheckSquare size={16} color="#3B6D11" /> : <Square size={16} color="#ccc" />}
                    </div>
                    <div>
                      <h4 style={s.aiTaskTitle}>{t.title}</h4>
                      <p style={s.aiTaskDesc}>{t.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Field label="Status">
            <select style={s.input} value={form.status} onChange={(e) => set('status', e.target.value as ProjectStatus)}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          <div style={s.row}>
            <Field label="Start Date">
              <input type="date" style={s.input} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </Field>
            <Field label="End Date" error={errors.endDate}>
              <input type="date" style={{ ...s.input, ...(errors.endDate ? s.inputErr : {}) }}
                value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </Field>
          </div>

          <Field label="Members" hint="Comma-separated emails">
            <input style={s.input} placeholder="john@example.com, sara@example.com"
              value={form.members} onChange={(e) => set('members', e.target.value)} />
          </Field>

          {!isEdit && (
            <Field label="Project Owner" hint="Automatically set to your email">
              <input style={{ ...s.input, background: '#f4f7f2', cursor: 'not-allowed' }}
                value={form.ownerId} disabled />
            </Field>
          )}

          {isEdit && (
            <Field label="Project Owner" required error={errors.ownerId}>
              <input style={{ ...s.input, ...(errors.ownerId ? s.inputErr : {}) }}
                placeholder="owner@example.com"
                value={form.ownerId} onChange={(e) => set('ownerId', e.target.value)} />
            </Field>
          )}
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <button type="button" style={s.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" style={s.saveBtn}   onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
            {isEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function Field({ label, required, error, hint, children }:
  { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#27500A' }}>
        {label}{required && <span style={{ color: '#A32D2D' }}> *</span>}
        {hint && <span style={{ fontWeight: 400, color: '#7a9e7a', fontSize: 12 }}> — {hint}</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: 12, color: '#A32D2D' }}>{error}</span>}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
  modal:     { background: '#fff', borderRadius: 18, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease', maxHeight: '90vh', overflowY: 'auto', fontFamily: "Arial, Helvetica, sans-serif" },
  mHeader:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid #f0f4ee' },
  mIcon:     { width: 36, height: 36, borderRadius: 9, background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mTitle:    { margin: 0, fontSize: 17, fontWeight: 700, color: '#1a2e0f' },
  closeBtn:  { background: '#f4f7f2', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7a9e7a' },
  form:      { padding: 20, display: 'flex', flexDirection: 'column', gap: 16 },
  input:     { width: '100%', padding: '10px 12px', border: '1.5px solid #C0DD97', borderRadius: 9, fontSize: 14, color: '#1a2e0f', outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit' },
  inputErr:  { borderColor: '#F09595' },
  textarea:  { resize: 'vertical', lineHeight: '1.6' },
  row:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  footer:    { display: 'flex', gap: 10, padding: '14px 20px 20px', justifyContent: 'flex-end', borderTop: '1px solid #f0f4ee' },
  cancelBtn: { padding: '10px 20px', background: '#f4f7f2', color: '#3B6D11', border: 'none', borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
  saveBtn:   { display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'linear-gradient(135deg,#3B6D11,#639922)', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
  submitErr: { background: '#FCEBEB', border: '1px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D' },
  aiSection: { marginTop: 4, padding: '16px', background: '#F8FAF5', borderRadius: 12, border: '1px solid #EAF3DE' },
  aiHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  aiTitle:   { margin: 0, fontSize: 14, fontWeight: 600, color: '#27500A', display: 'flex', alignItems: 'center', gap: 6 },
  aiBtn:     { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#fff', border: '1px solid #C0DD97', borderRadius: 6, color: '#3B6D11', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  aiTaskList: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' },
  aiTaskItem: { display: 'flex', gap: 10, padding: '10px 12px', background: '#fff', border: '1px solid #eaeaea', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' },
  aiTaskSelected: { border: '1px solid #C0DD97', background: '#FAFCF8' },
  aiTaskCheckbox: { marginTop: 2 },
  aiTaskTitle: { margin: 0, fontSize: 13, fontWeight: 600, color: '#1a2e0f', marginBottom: 2 },
  aiTaskDesc: { margin: 0, fontSize: 12, color: '#7a9e7a', lineHeight: '1.4' },
};