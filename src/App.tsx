import React, { useState, useMemo, useEffect } from 'react';
import { 
  AlertCircle, 
  Clock, 
  Construction, 
  MapPin, 
  Upload, 
  FileText, 
  ChevronRight, 
  TrendingUp,
  Filter,
  Download,
  Search,
  LayoutDashboard,
  Table as TableIcon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { analyzeProjects, DashboardStats, ProjectData, getDetailedStatus } from './services/analysisService';
import { cn } from './lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, ringColor, description, onClick, isActive }: any) => (
  <motion.div 
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-white p-6 rounded-xl border shadow-sm transition-all cursor-pointer",
      isActive ? `ring-2 ring-offset-2 ${ringColor || 'ring-indigo-500'} border-transparent` : "border-slate-200 hover:shadow-md hover:border-slate-300"
    )}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-slate-900">{value}</h3>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <div className={cn("p-3 rounded-lg", color)}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </motion.div>
);

interface ProjectRowProps {
  project: ProjectData;
  type: 'red' | 'pending' | 'execution' | 'priority' | 'aa' | 'ts' | 'dtp' | 'tender' | 'ta' | 'loaWo';
  onViewDetails: (project: ProjectData) => void;
}

const ProjectRow: React.FC<ProjectRowProps> = ({ project, type, onViewDetails }) => {
  const colors = {
    red: "border-l-red-500 bg-red-50/30",
    pending: "border-l-amber-500 bg-amber-50/30",
    execution: "border-l-blue-500 bg-blue-50/30",
    priority: "border-l-emerald-500 bg-emerald-50/30",
    aa: "border-l-purple-500 bg-purple-50/30",
    ts: "border-l-orange-500 bg-orange-50/30",
    dtp: "border-l-lime-500 bg-lime-50/30",
    tender: "border-l-cyan-500 bg-cyan-50/30",
    ta: "border-l-indigo-500 bg-indigo-50/30",
    loaWo: "border-l-violet-500 bg-violet-50/30"
  };

  const rawValues = Object.values(project.raw);
  const paaAmountRaw = String(rawValues[7] || '').trim();
  const paaDateRaw = String(rawValues[8] || '').trim();
  
  let paaAmount = paaAmountRaw;
  if (paaAmount && !paaAmount.toLowerCase().includes('lakh')) {
    paaAmount += ' Lakh';
  }

  return (
    <div className={cn("flex items-center justify-between p-4 border-l-4 rounded-r-lg border-y border-r border-slate-100 mb-3", colors[type])}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-sm font-semibold text-slate-800 truncate">{project.name}</h4>
            {project.isHighPriority && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase shrink-0">Priority</span>
            )}
          </div>
        </div>
        
        {(paaAmountRaw || paaDateRaw) && (
          <div className="mt-1">
            <span className="text-xs font-bold text-slate-500">
              PAA: {paaAmount || 'N/A'} Dt: {paaDateRaw || 'N/A'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 mt-1">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={12} /> {project.district || 'Unknown District'}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={12} /> {getDetailedStatus(project)}
          </span>
        </div>
      </div>
      <div className="text-right ml-4 shrink-0 flex flex-col justify-between items-end">
        {type === 'red' && project.alertType && (
          <div className="flex flex-col items-end">
            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full uppercase mb-1">
              {project.alertType}
            </span>
            <p className="text-xs font-semibold text-red-600 max-w-[150px] truncate" title={project.alertMessage}>
              {project.alertMessage}
            </p>
          </div>
        )}
        <p className="text-xs font-medium text-slate-600 mt-1">
          {type === 'execution' && project.timeLimit && `${project.timeLimit} Months`}
        </p>
        <button 
          onClick={() => onViewDetails(project)}
          className="text-xs text-indigo-600 font-semibold mt-1 hover:underline flex items-center gap-1"
        >
          Details <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

const CategorySection = ({ category, stats, isFullView, onViewDetails, onExpand, onBack }: { category: string, stats: DashboardStats, isFullView?: boolean, onViewDetails: (p: ProjectData) => void, onExpand?: () => void, onBack?: () => void }) => {
  let title, icon, colorClass, items, type, headerExtra, emptyMsg, expandMsg;
  const limit = 5;

  switch (category) {
    case 'red':
      title = isFullView ? 'Red Alerts Full List' : 'Red Alerts';
      icon = <AlertCircle size={18} />;
      colorClass = 'bg-red-50/50';
      items = stats.redAlerts;
      type = 'red';
      emptyMsg = 'No critical alerts found.';
      expandMsg = 'critical alerts';
      headerExtra = (
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">BE: {stats.redAlerts.filter(p => p.alertStage === 'BE').length}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">TS: {stats.redAlerts.filter(p => p.alertStage === 'TS').length}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">DTP: {stats.redAlerts.filter(p => p.alertStage === 'DTP').length}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Tender: {stats.redAlerts.filter(p => p.alertStage === 'Tender').length}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">LOA: {stats.redAlerts.filter(p => p.alertStage === 'LOA').length}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">WO: {stats.redAlerts.filter(p => p.alertStage === 'WO').length}</span>
          </div>
          {!isFullView && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full hidden sm:block">ACTION REQUIRED</span>}
        </div>
      );
      break;
    case 'aa':
      title = 'Pending AA Works';
      icon = <FileText size={18} />;
      colorClass = 'bg-purple-50/50';
      items = stats.pendingAA;
      type = 'aa';
      emptyMsg = 'No pending AA works.';
      expandMsg = 'pending AA files';
      headerExtra = (
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">D: {stats.pendingAA.filter(p => p.currentLocation === 'D').length}</span>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">C: {stats.pendingAA.filter(p => p.currentLocation === 'C').length}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">G: {stats.pendingAA.filter(p => p.currentLocation === 'G').length}</span>
          </div>
          {!isFullView && <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full hidden sm:block">AWAITING ADMIN APPROVAL</span>}
        </div>
      );
      break;
    case 'ts':
      title = 'Pending TS Works';
      icon = <FileText size={18} />;
      colorClass = 'bg-orange-50/50';
      items = stats.pendingTS;
      type = 'ts';
      emptyMsg = 'No pending TS works.';
      expandMsg = 'pending TS files';
      headerExtra = (
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">D: {stats.pendingTS.filter(p => getDetailedStatus(p).includes(' at D')).length}</span>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">C: {stats.pendingTS.filter(p => getDetailedStatus(p).includes(' at C')).length}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">G: {stats.pendingTS.filter(p => getDetailedStatus(p).includes(' at G') || getDetailedStatus(p).includes(' at Govt')).length}</span>
          </div>
        </div>
      );
      break;
    case 'dtp':
      title = 'Pending DTP Works';
      icon = <FileText size={18} />;
      colorClass = 'bg-lime-50/50';
      items = stats.pendingDTP;
      type = 'dtp';
      emptyMsg = 'No pending DTP works.';
      expandMsg = 'pending DTP files';
      headerExtra = (
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">D: {stats.pendingDTP.filter(p => getDetailedStatus(p).includes(' at D')).length}</span>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">C: {stats.pendingDTP.filter(p => getDetailedStatus(p).includes(' at C')).length}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">G: {stats.pendingDTP.filter(p => getDetailedStatus(p).includes(' at G') || getDetailedStatus(p).includes(' at Govt')).length}</span>
          </div>
        </div>
      );
      break;
    case 'tender':
      title = 'Tender Level Works';
      icon = <Clock size={18} />;
      colorClass = 'bg-cyan-50/50';
      items = stats.tenderLevel;
      type = 'tender';
      emptyMsg = 'No works at tender level.';
      expandMsg = 'tender level files';
      headerExtra = (
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Ø: {stats.tenderLevel.filter(p => getDetailedStatus(p) === 'Pending for Online').length}</span>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">O: {stats.tenderLevel.filter(p => getDetailedStatus(p) === 'Tender Online').length}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">E: {stats.tenderLevel.filter(p => getDetailedStatus(p) === 'Tender Under Evaluation').length}</span>
          </div>
        </div>
      );
      break;
    case 'ta':
      title = 'Tender Approvals Pending';
      icon = <Clock size={18} />;
      colorClass = 'bg-indigo-50/50';
      items = stats.tenderApprovals;
      type = 'ta';
      emptyMsg = 'No pending tender approvals.';
      expandMsg = 'pending TA files';
      headerExtra = (
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">D: {stats.tenderApprovals.filter(p => getDetailedStatus(p).includes(' at D')).length}</span>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">C: {stats.tenderApprovals.filter(p => getDetailedStatus(p).includes(' at C')).length}</span>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">G: {stats.tenderApprovals.filter(p => getDetailedStatus(p).includes(' at G')).length}</span>
          </div>
        </div>
      );
      break;
    case 'loaWo':
      title = 'LOA-WO Level';
      icon = <FileText size={18} />;
      colorClass = 'bg-violet-50/50';
      items = stats.loaWoLevel;
      type = 'loaWo';
      emptyMsg = 'No works at LOA/WO level.';
      expandMsg = 'LOA/WO level files';
      headerExtra = (
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">LOA: {stats.loaWoLevel.filter(p => getDetailedStatus(p) === 'LOA Level').length}</span>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">WO: {stats.loaWoLevel.filter(p => getDetailedStatus(p) === 'WO Level').length}</span>
          </div>
        </div>
      );
      break;
    case 'execution':
      title = 'Execution Phase';
      icon = <Construction size={18} />;
      colorClass = 'bg-blue-50/50';
      items = stats.executionDelays;
      type = 'execution';
      emptyMsg = 'No works in execution phase.';
      expandMsg = 'execution files';
      headerExtra = <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">WORKS IN PROGRESS</span>;
      break;
    case 'priority':
      title = 'High Priority Routes';
      icon = <MapPin size={18} />;
      colorClass = 'bg-emerald-50/50';
      items = stats.highPriority;
      type = 'priority';
      emptyMsg = 'No priority routes identified.';
      expandMsg = 'priority routes';
      headerExtra = null;
      break;
    default:
      return null;
  }

  const displayItems = isFullView ? items : items.slice(0, limit || 5);
  const titleColor = `text-${colorClass.split('-')[1]}-800`; // e.g. text-red-800

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className={cn("px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-2xl", colorClass, isFullView ? "sticky top-16 z-20 shadow-sm" : "")}>
        <div className="flex items-center gap-4">
          {isFullView && onBack && (
            <button 
              onClick={onBack} 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 hover:bg-white/80 transition-colors shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} className={titleColor} />
            </button>
          )}
          <h3 className={cn("text-sm font-bold flex items-center gap-2 uppercase tracking-wider", titleColor)}>
            {icon} {title}
          </h3>
        </div>
        {headerExtra}
      </div>
      <div className="p-6">
        {displayItems.length > 0 ? (
          displayItems.map(p => <ProjectRow key={p.id} project={p} type={type as any} onViewDetails={onViewDetails} />)
        ) : (
          <p className="text-sm text-slate-400 text-center py-4 italic">{emptyMsg}</p>
        )}
        {!isFullView && items.length > (limit || 5) && onExpand && (
          <button onClick={onExpand} className="w-full text-center text-xs font-bold text-slate-400 mt-2 hover:text-slate-600 transition-colors">
            View all {items.length} {expandMsg}
          </button>
        )}
      </div>
    </section>
  );
};

const CategoryFullView = ({ category, stats, onBack, onViewDetails }: { category: string, stats: DashboardStats, onBack: () => void, onViewDetails: (p: ProjectData) => void }) => {
  return (
    <div className="space-y-6">
      <CategorySection category={category} stats={stats} isFullView={true} onViewDetails={onViewDetails} onBack={onBack} />
      <div className="pt-4">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

const ProjectDetailsView = ({ project, onBack }: { project: ProjectData, onBack: () => void }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 bg-slate-50 sticky top-16 z-20 rounded-t-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <button 
                onClick={onBack} 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 transition-colors shrink-0 mt-1"
                title="Back to Dashboard"
              >
                <ArrowLeft size={16} className="text-slate-600" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{project.name}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} /> {project.district || 'Unknown District'}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock size={14} /> {getDetailedStatus(project)}
                  </span>
                </div>
              </div>
            </div>
            {project.isHighPriority && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase shrink-0">Priority</span>
            )}
          </div>
          {project.alertType && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-red-800 uppercase">{project.alertType}</h4>
                <p className="text-sm text-red-600 mt-1">{project.alertMessage}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">All Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(project.raw).map(([key, value]) => {
              if (!key || key.trim() === '') return null;
              return (
                <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{key}</p>
                  <p className="text-sm text-slate-900 font-medium break-words">{String(value || 'N/A')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table'>('dashboard');
  const [activeCategory, setActiveCategory] = useState<'red' | 'aa' | 'ts' | 'dtp' | 'tender' | 'ta' | 'loaWo' | 'execution' | 'priority' | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string>('RC2');
  const [searchTerm, setSearchTerm] = useState('');
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1fvb5M7f-rajXCgPF7ntDiQaeD6mJwq_5jdo6TL_NsKQ/edit?gid=0#gid=0');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

  const divisions = ['Amreli', 'Bhavnagar', 'Junagadh', 'Botad', 'Porbandar', 'Veraval'];

  const filteredRawData = useMemo(() => {
    if (selectedDivision === 'RC2') return rawData;
    return rawData.filter(row => {
      const div = String(row['Division'] || row['District'] || '').trim().toLowerCase();
      return div.includes(selectedDivision.toLowerCase());
    });
  }, [rawData, selectedDivision]);

  const stats = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;
    return analyzeProjects(filteredRawData || []);
  }, [filteredRawData, rawData]);

  useEffect(() => {
    if (!hasInitialLoaded && sheetUrl && rawData.length === 0) {
      setHasInitialLoaded(true);
      handleGoogleSheetImport();
    }
  }, [hasInitialLoaded, sheetUrl, rawData.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setRawData(results.data);
          setIsLoading(false);
        }
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setIsLoading(true);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setRawData(results.data);
          setIsLoading(false);
        }
      });
    }
  };

  const handleGoogleSheetImport = () => {
    if (!sheetUrl) return;
    setIsLoading(true);
    
    let fetchUrl = sheetUrl;
    // Auto-convert standard Google Sheets URL to CSV export URL
    const matchId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (matchId) {
      const sheetId = matchId[1];
      const matchGid = sheetUrl.match(/[#&]gid=([0-9]+)/);
      const gid = matchGid ? matchGid[1] : '0';
      fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    }

    Papa.parse(fetchUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setRawData(results.data);
        } else {
          alert("No data found or unable to parse the sheet.");
        }
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Error fetching sheet:", error);
        alert("Failed to fetch data. Please ensure the Google Sheet is set to 'Anyone with the link can view'.");
        setIsLoading(false);
      }
    });
  };

  const chartData = useMemo(() => {
    if (!stats) return [];
    const totalStatusProjects = stats.projectStatus.notStarted + stats.projectStatus.inProgress + stats.projectStatus.phyCompleted + stats.projectStatus.completed + stats.projectStatus.stopped;
    return [
      { name: 'Not Started', value: stats.projectStatus.notStarted, color: '#94a3b8' },
      { name: 'In Progress', value: stats.projectStatus.inProgress, color: '#3b82f6' },
      { name: 'Phy. Completed', value: stats.projectStatus.phyCompleted, color: '#8b5cf6' },
      { name: 'Completed', value: stats.projectStatus.completed, color: '#10b981' },
      { name: 'Stopped', value: stats.projectStatus.stopped, color: '#ef4444' },
      { name: 'Total Projects', value: totalStatusProjects, color: '#6366f1' },
    ];
  }, [stats]);

  const filteredProjects = useMemo(() => {
    if (!filteredRawData) return [];
    return filteredRawData.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [filteredRawData, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">(R&B) Circle No. 2 Dashboard</h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Superintending Engineer, Rajkot</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2",
                    activeTab === 'dashboard' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('table')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2",
                    activeTab === 'table' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <TableIcon size={14} /> Data Table
                </button>
              </div>
              
              {rawData.length > 0 && (
                <button 
                  onClick={() => { setRawData([]); }}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-2 border border-red-200 rounded-lg bg-red-50"
                >
                  Reset Data
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!stats ? (
          <div className="max-w-2xl mx-auto mt-12 space-y-8">
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer relative",
                isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-white hover:border-slate-400",
                isLoading && "opacity-50 pointer-events-none"
              )}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-2xl z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              )}
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="text-indigo-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Upload Project Spreadsheet</h2>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                Drag and drop your daily CSV or Excel file here to analyze bottlenecks and bid validity.
              </p>
              
              <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors cursor-pointer inline-flex items-center gap-2">
                <FileText size={18} /> Choose File
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isLoading} />
              </label>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 px-3 text-sm font-medium text-slate-500 uppercase tracking-widest">Or Import from Google Sheets</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
               {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-2xl z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-900 mb-2">Connect Google Sheet</h3>
              <p className="text-sm text-slate-500 mb-4">
                Paste the URL of your Google Sheet. <strong className="text-slate-700">Important:</strong> The sheet must be set to "Anyone with the link can view".
              </p>
              <div className="flex gap-3">
                <input 
                  type="url" 
                  placeholder="https://docs.google.com/spreadsheets/d/..." 
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  onClick={handleGoogleSheetImport}
                  disabled={!sheetUrl || isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap"
                >
                  Import Data
                </button>
                <button 
                  onClick={() => { setRawData([]); setSheetUrl(''); }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Required Columns</h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Project Name</li>
                  <li>• Status (PAA, AA, TS, etc.)</li>
                  <li>• Location (D, C, G)</li>
                  <li>• Dispatch Date (Col Y)</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Analysis Rules</h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• 120-Day Bid Validity</li>
                  <li>• Govt Bottleneck (60+ Days)</li>
                  <li>• High Priority Tracking</li>
                </ul>
              </div>
            </div>
          </div>
        ) : selectedProject ? (
          <ProjectDetailsView project={selectedProject} onBack={() => setSelectedProject(null)} />
        ) : activeCategory ? (
          <CategoryFullView category={activeCategory} stats={stats} onBack={() => setActiveCategory(null)} onViewDetails={setSelectedProject} />
        ) : (
          <div className="space-y-8">
            {/* Division Filter */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
              <div className="px-4 py-2 border-r border-slate-100 flex items-center gap-2 mr-2">
                <Filter size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Division Filter</span>
              </div>
              <button 
                onClick={() => setSelectedDivision('RC2')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  selectedDivision === 'RC2' ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                RC2 (All)
              </button>
              {divisions.map(div => (
                <button 
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    selectedDivision === div ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {div}
                </button>
              ))}
            </div>

            {activeTab === 'dashboard' ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Red Alerts" 
                    value={stats.redAlerts.length} 
                    icon={AlertCircle} 
                    color="bg-red-500"
                    ringColor="ring-red-500"
                    description="Critical validity or delays"
                    isActive={activeCategory === 'red'}
                    onClick={() => setActiveCategory(activeCategory === 'red' ? null : 'red')}
                  />
                  <StatCard 
                    title="Pending AA" 
                    value={stats.pendingAA.length} 
                    icon={FileText} 
                    color="bg-purple-500"
                    ringColor="ring-purple-500"
                    description="Awaiting Admin Approval"
                    isActive={activeCategory === 'aa'}
                    onClick={() => setActiveCategory(activeCategory === 'aa' ? null : 'aa')}
                  />
                  <StatCard 
                    title="Pending TS" 
                    value={stats.pendingTS.length} 
                    icon={FileText} 
                    color="bg-orange-500"
                    ringColor="ring-orange-500"
                    description="Awaiting Tech Sanction"
                    isActive={activeCategory === 'ts'}
                    onClick={() => setActiveCategory(activeCategory === 'ts' ? null : 'ts')}
                  />
                  <StatCard 
                    title="Pending DTP" 
                    value={stats.pendingDTP.length} 
                    icon={FileText} 
                    color="bg-lime-500"
                    ringColor="ring-lime-500"
                    description="Awaiting DTP Approval"
                    isActive={activeCategory === 'dtp'}
                    onClick={() => setActiveCategory(activeCategory === 'dtp' ? null : 'dtp')}
                  />
                  <StatCard 
                    title="Tender Level" 
                    value={stats.tenderLevel.length} 
                    icon={Clock} 
                    color="bg-cyan-500"
                    ringColor="ring-cyan-500"
                    description="Online / DTP Stage"
                    isActive={activeCategory === 'tender'}
                    onClick={() => setActiveCategory(activeCategory === 'tender' ? null : 'tender')}
                  />
                  <StatCard 
                    title="Tender Approvals" 
                    value={stats.tenderApprovals.length} 
                    icon={Clock} 
                    color="bg-indigo-500"
                    ringColor="ring-indigo-500"
                    description="Pending TA"
                    isActive={activeCategory === 'ta'}
                    onClick={() => setActiveCategory(activeCategory === 'ta' ? null : 'ta')}
                  />
                  <StatCard 
                    title="LOA-WO Level" 
                    value={stats.loaWoLevel.length} 
                    icon={FileText} 
                    color="bg-violet-500"
                    ringColor="ring-violet-500"
                    description="Pending LOA/WO"
                    isActive={activeCategory === 'loaWo'}
                    onClick={() => setActiveCategory(activeCategory === 'loaWo' ? null : 'loaWo')}
                  />
                  <StatCard 
                    title="Execution Phase" 
                    value={stats.executionDelays.length} 
                    icon={Construction} 
                    color="bg-blue-500"
                    ringColor="ring-blue-500"
                    description="Works in progress"
                    isActive={activeCategory === 'execution'}
                    onClick={() => setActiveCategory(activeCategory === 'execution' ? null : 'execution')}
                  />
                  <StatCard 
                    title="High Priority" 
                    value={stats.highPriority.length} 
                    icon={MapPin} 
                    color="bg-emerald-500"
                    ringColor="ring-emerald-500"
                    description="Tourist / Pravasipath"
                    isActive={activeCategory === 'priority'}
                    onClick={() => setActiveCategory(activeCategory === 'priority' ? null : 'priority')}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Charts & Summary */}
                  <div className="space-y-8">
                    {/* Distribution Chart */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Project Status: {selectedDivision}</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                              width={100}
                            />
                            <Tooltip 
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {chartData.map((item) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    {/* Quick Actions */}
                    <section className="bg-indigo-900 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                      <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-xl text-left transition-colors flex items-center justify-between group">
                          <div>
                            <p className="text-sm font-bold">Generate Report</p>
                            <p className="text-[10px] text-indigo-300">Daily SE Summary PDF</p>
                          </div>
                          <Download size={18} className="text-indigo-300 group-hover:text-white" />
                        </button>
                        <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-xl text-left transition-colors flex items-center justify-between group">
                          <div>
                            <p className="text-sm font-bold">Email Alerts</p>
                            <p className="text-[10px] text-indigo-300">Notify Executive Engineers</p>
                          </div>
                          <ChevronRight size={18} className="text-indigo-300 group-hover:text-white" />
                        </button>
                      </div>
                    </section>

                    {/* Jurisdiction Info */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Jurisdiction</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Amreli', 'Bhavnagar', 'Junagadh', 'Botad', 'Porbandar', 'Gir Somnath'].map(city => (
                          <span key={city} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">{city}</span>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search projects, districts, status..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-100">
                      <Filter size={14} /> Filter
                    </button>
                    <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-100">
                      <Download size={14} /> Export CSV
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">District</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount (Cr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredProjects.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-800">{row['Work Name'] || row['Project Name'] || row['Name'] || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-500">{row['Division'] || row['District'] || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase">
                              {row['Proposal Status'] || row['Status'] || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 text-[10px] font-bold rounded-md",
                              (row['BE Status'] === 'G' || row['Location'] === 'G' || row['Proposal Status'] === 'G') ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
                            )}>
                              {row['BE Status'] || row['Location'] || row['Current Location'] || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-mono font-bold text-slate-700">{row['Approved Amount'] || row['Column Y'] || '0.00'}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">(R&B) Circle No. 2 • Monitoring System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
