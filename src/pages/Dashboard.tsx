import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Skeleton,
  Alert,
} from "@mui/material";
import { 
  Plus, 
  Users, 
  Briefcase, 
  ArrowUpRight,
  Layout,
  ChevronRight,
  Lightbulb
} from "lucide-react";
import ProjectModal from "../components/ProjectsModal";
import { getDashboardStats, getRecentProjects } from "../services/dashboardService";
import { DashboardStats, DashboardProject } from "../types/Dashboard.types";

const WORKSPACE_TIPS = [
  {
    title: "Knowledge Base",
    text: "Group your documents by project in the Knowledge Base tab for better team organization.",
    linkText: "Go to Documents"
  },
  {
    title: "Project Health",
    text: "Keep an eye on the progress bars in your Recent Projects to track completion rates.",
    linkText: "View Projects"
  },
  {
    title: "Collaboration",
    text: "Invite team members to specific projects to share resources and track tasks together.",
    linkText: "Invite Members"
  },
  {
    title: "Quick Access",
    text: "Use the '+ New Project' button to quickly set up a new workspace for your next big idea.",
    linkText: "Create Project"
  }
];

// ── Components ──────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, loading, color }: {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  loading: boolean;
  color: string;
}) => (
  <div style={{...styles.statCard, borderLeft: `4px solid ${color}`}}>
    <div style={styles.statInfo}>
      <span style={styles.statTitle}>{title}</span>
      {loading ? (
        <Skeleton variant="text" width={40} height={32} />
      ) : (
        <h2 style={styles.statValue}>{value ?? "0"}</h2>
      )}
    </div>
    <div style={{...styles.statIconWrapper, backgroundColor: `${color}15`, color: color}}>
      {icon}
    </div>
  </div>
);

const ProjectListItem = ({ project }: { project: DashboardProject }) => (
  <div style={styles.projectItem}>
    <div style={styles.projectMain}>
      <div style={styles.projectIcon}>
        {project.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h4 style={styles.projectName}>{project.name}</h4>
        <span style={styles.projectMeta}>{project.memberCount} members · {project.status}</span>
      </div>
    </div>
    <div style={styles.projectProgressWrapper}>
      <div style={styles.progressHeader}>
        <span style={styles.progressLabel}>Progress</span>
        <span style={styles.progressValue}>{project.progress}%</span>
      </div>
      <div style={styles.progressBarBg}>
        <div style={{...styles.progressBarFill, width: `${project.progress}%`}} />
      </div>
    </div>
    <button style={styles.detailsBtn}>
      <ArrowUpRight size={16} />
    </button>
  </div>
);

// ── Main Layout ─────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [tipFade, setTipFade] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, projectsRes] = await Promise.all([
        getDashboardStats(),
        getRecentProjects(5),
      ]);
      setStats(statsRes);
      setProjects(projectsRes);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tip Rotation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTipFade(false);
      setTimeout(() => {
        setActiveTipIndex((prev) => (prev + 1) % WORKSPACE_TIPS.length);
        setTipFade(true);
      }, 500); // Wait for fade out
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      {/* Hero Welcome */}
      <div style={styles.hero}>
        <div>
          <h1 style={styles.welcomeText}>Welcome back! 👋</h1>
          <p style={styles.heroSub}>Here's what's happening with your projects today.</p>
        </div>
        <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 
          0% { transform: scale(1); opacity: 0.8; } 
          50% { transform: scale(1.1); opacity: 1; } 
          100% { transform: scale(1); opacity: 0.8; } 
        }
      `}</style>
        <Button 
          variant="contained" 
          onClick={() => setShowModal(true)}
          style={styles.newProjectBtn}
          startIcon={<Plus size={18} />}
        >
          New Project
        </Button>
      </div>

      {showModal && (
        <ProjectModal
          project={null}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData(); }}
        />
      )}

      {error && (
        <Alert severity="error" style={styles.alert} action={<Button color="inherit" size="small" onClick={fetchData}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {/* Stats Section */}
      <div style={styles.statsGrid}>
        <StatCard 
          title="Active Projects" 
          value={stats?.activeProjects ?? 0} 
          icon={<Briefcase size={20} />} 
          loading={loading}
          color="#3B6D11"
        />
        <StatCard 
          title="Team Members" 
          value={stats?.teamMembers ?? 0} 
          icon={<Users size={20} />} 
          loading={loading}
          color="#1A2E0F"
        />
      </div>

      {/* Main Content Area */}
      <div style={styles.mainGrid}>
        {/* Recent Projects Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleGroup}>
              <Layout size={18} style={{ color: '#3B6D11' }} />
              <h3 style={styles.cardTitle}>Recent Projects</h3>
            </div>
            <button style={styles.linkBtn} onClick={() => navigate('/projects')}>View All <ChevronRight size={14} /></button>
          </div>

          <div style={styles.cardBody}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                </div>
              ))
            ) : projects.length === 0 ? (
              <div style={styles.empty}>
                <p>No projects yet. Start by creating one!</p>
              </div>
            ) : (
              projects.map(project => (
                <ProjectListItem key={project._id} project={project} />
              ))
            )}
          </div>
        </div>

        {/* Quick Insights / Placeholder for secondary functionality */}
        <div style={styles.sideCol}>
          <div style={{...styles.card, background: 'linear-gradient(135deg, #1A2E0F, #3B6D11)', color: '#fff', position: 'relative', overflow: 'hidden'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={styles.pulseIcon}>
                <Lightbulb size={18} style={{ color: '#C0DD97' }} />
              </div>
              <h3 style={{...styles.cardTitle, color: '#fff', fontSize: 16}}>Workspace Tip</h3>
            </div>
            
            <div style={{ opacity: tipFade ? 1 : 0, transition: 'opacity 0.5s ease', minHeight: 80 }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#C0DD97' }}>
                {WORKSPACE_TIPS[activeTipIndex].title}
              </h4>
              <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
                {WORKSPACE_TIPS[activeTipIndex].text}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <Button size="small" variant="text" style={{ color: '#C0DD97', padding: 0 }}>
                {WORKSPACE_TIPS[activeTipIndex].linkText}
              </Button>
              <div style={styles.dotGroup}>
                {WORKSPACE_TIPS.map((_, i) => (
                  <div key={i} style={{...styles.dot, opacity: i === activeTipIndex ? 1 : 0.3}} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Styles ──────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '32px 24px', maxWidth: 1200, margin: '0 auto', fontFamily: "Inter, sans-serif" },
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  welcomeText: { fontSize: 28, fontWeight: 800, color: '#1A2E0F', margin: 0, letterSpacing: '-0.025em' },
  heroSub: { fontSize: 15, color: '#7a9e7a', margin: '4px 0 0 0' },
  newProjectBtn: { 
    background: 'linear-gradient(135deg, #3B6D11, #639922)', 
    borderRadius: 12, 
    padding: '10px 20px', 
    textTransform: 'none', 
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(59,109,17,0.15)'
  },
  alert: { marginBottom: 24, borderRadius: 12 },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 },
  statCard: { 
    background: '#fff', 
    padding: 24, 
    borderRadius: 16, 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    transition: 'transform 0.2s ease'
  },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statTitle: { fontSize: 13, color: '#7a9e7a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  statValue: { fontSize: 28, fontWeight: 800, margin: '4px 0 0 0', color: '#1A2E0F' },
  statIconWrapper: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 },
  card: { background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.03)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitleGroup: { display: 'flex', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: 700, margin: 0, color: '#1A2E0F' },
  linkBtn: { background: 'none', border: 'none', color: '#3B6D11', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
  cardBody: { display: 'flex', flexDirection: 'column', gap: 12 },

  projectItem: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '12px 16px', 
    borderRadius: 14, 
    background: '#F8FAF7', 
    gap: 16,
    border: '1px solid transparent',
    transition: 'all 0.2s ease'
  },
  projectMain: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 },
  projectIcon: { width: 36, height: 36, borderRadius: 10, background: '#3B6D11', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
  projectName: { margin: 0, fontSize: 15, fontWeight: 600, color: '#1A2E0F' },
  projectMeta: { fontSize: 12, color: '#9cb69c' },
  projectProgressWrapper: { width: 140 },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 10, color: '#7a9e7a', fontWeight: 600, textTransform: 'uppercase' },
  progressValue: { fontSize: 11, color: '#3B6D11', fontWeight: 700 },
  progressBarBg: { height: 6, background: '#E0E8DC', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', background: '#3B6D11', borderRadius: 3 },
  detailsBtn: { padding: 8, background: '#fff', border: '1px solid #E0E8DC', borderRadius: 10, color: '#7a9e7a', cursor: 'pointer' },

  sideCol: { display: 'flex', flexDirection: 'column' },
  pulseIcon: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    animation: 'pulse 2s infinite ease-in-out'
  },
  dotGroup: { display: 'flex', gap: 4 },
  dot: { width: 4, height: 4, borderRadius: '50%', background: '#fff', transition: 'opacity 0.3s ease' },
  empty: { textAlign: 'center', padding: '40px 0', color: '#9cb69c' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 16 }
};

export default Dashboard;
