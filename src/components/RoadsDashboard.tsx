import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Route, ShieldCheck, AlertTriangle, Construction, Activity, ArrowLeft, Search, Map as MapIcon, Navigation, Signpost, Milestone, Compass, Car } from 'lucide-react';
import { cn } from '../lib/utils';
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

interface RoadsDashboardProps {
  data: any[];
  structureData?: any[];
  selectedDivision: string;
  onDetailViewChange?: (isDetail: boolean) => void;
  resetViewTrigger?: number;
}

const StatCard = ({ title, value, icon: Icon, color, description, onClick, extra }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={cn(
      "bg-white p-6 rounded-xl border border-slate-200 shadow-sm",
      onClick ? "cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all" : ""
    )}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-slate-900">{value}</h3>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        {extra && <div className="mt-2">{extra}</div>}
      </div>
      <div className={cn("p-3 rounded-lg", color)}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </motion.div>
);

const RoadDetailsView = ({ road, onBack }: { road: any, onBack: () => void }) => {
  const keys = Object.keys(road);
  
  const getSectionData = (start: number, end: number) => {
    return keys.slice(start, end + 1).map(key => ({
      label: key,
      value: road[key]
    })).filter(item => item.value !== undefined && item.value !== '');
  };

  // Using the exact column indices provided
  // A to I (0 to 8)
  const basicDetails = getSectionData(0, 8); 
  // K to AH (10 to 33)
  const dlpDetails = getSectionData(10, 33); 
  // AJ to BG (35 to 58)
  const nonDlpDetails = getSectionData(35, 58); 
  // BI to BL (60 to 63)
  const wipDetails = getSectionData(60, 63); 
  // BN to BS (65 to 70)
  const structureDetails = getSectionData(65, 70); 

  const findKey = (searchStr: string) => {
    const normalizedSearch = searchStr.replace(/\s+/g, '').toLowerCase();
    return keys.find(k => k.replace(/\s+/g, '').toLowerCase().includes(normalizedSearch)) || searchStr;
  };

  const summaryDetails = [
    { label: 'Road Name', value: road['Road Name with Chainages'] || road[keys[0]] },
    { label: 'Category', value: road['Road Category'] || road[keys[1]] },
    { label: 'DLP પેવર પટ્ટા ની બાકી રહેલ લંબાઇ = (d - a)', value: road[findKey('DLPપેવરપટ્ટાનીબાકીરહેલલંબાઇ=(d-a)')] || road[findKey('DLPપેવરપટ્ટાનીબાકીરહેલલંબાઇ')] },
    { label: 'DLP માઇનર પેચવર્ક બાકી રહેલ લંબાઇ = (e -b)', value: road[findKey('DLPમાઇનરપેચવર્કબાકીરહેલલંબાઇ=(e-b)')] || road[findKey('DLPમાઇનરપેચવર્કબાકીરહેલલંબાઇ')] },
    { label: 'DLP બાકી રહેલ પોટહોલ્સ ની સંખ્યા = (p - c)', value: road[findKey('DLPબાકીરહેલપોટહોલ્સનીસંખ્યા=(p-c)')] || road[findKey('DLPબાકીરહેલપોટહોલ્સનીસંખ્યા')] },
    { label: 'Non DLP પેવર પટ્ટા ની બાકી રહેલ લંબાઇ = (d - a)', value: road[findKey('NonDLPપેવરપટ્ટાનીબાકીરહેલલંબાઇ=(d-a)')] || road[findKey('NonDLPપેવરપટ્ટાનીબાકીરહેલલંબાઇ')] },
    { label: 'Non DLP માઇનર પેચવર્ક બાકી રહેલ લંબાઇ = (e -b)', value: road[findKey('NonDLPમાઇનરપેચવર્કબાકીરહેલલંબાઇ=(e-b)')] || road[findKey('NonDLPમાઇનરપેચવર્કબાકીરહેલલંબાઇ')] },
    { label: 'Non DLP બાકી રહેલ પોટહોલ્સ ની સંખ્યા = (p - c)', value: road[findKey('NonDLPબાકીરહેલપોટહોલ્સનીસંખ્યા=(p-c)')] || road[findKey('NonDLPબાકીરહેલપોટહોલ્સનીસંખ્યા')] },
    { label: 'મરામત બાકી રહેલ લંબાઇ (WIP)', value: road[findKey('મરામતબાકીરહેલલંબાઇ(WIP)')] || road['WIP Length (In KM)'] },
    { label: 'પેચવર્ક ની બાકી રહેલ લંબાઇ DLP', value: road[findKey('પેચવર્કનીબાકીરહેલલંબાઇDLP')] },
    { label: 'પેચવર્ક ની બાકી રહેલ લંબાઇ NDLP', value: road[findKey('પેચવર્કનીબાકીરહેલલંબાઇNDLP')] },
  ];

  const Section = ({ title, data }: { title: string, data: any[] }) => {
    if (!data || data.length === 0) return null;
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-xs font-medium text-slate-500 break-words">{item.label}</p>
              <p className="text-sm font-semibold text-slate-900 break-words">{item.value || '-'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalLength = parseFloat(road['રસ્તાની કુલ લંબાઇ'] || '0') || 0;
  const damagedDLP = parseFloat(road[findKey('મરામતકરવાપાત્રલંબાઇ=a+b(DLP)')] || '0') || 0;
  const damagedNonDLP = parseFloat(road[findKey('મરામતકરવાપાત્રલંબાઇ=a+b(NonDLP)')] || '0') || 0;
  const damagedWIP = parseFloat(road[findKey('મરામતબાકીરહેલલંબાઇ(WIP)')] || road['WIP Length (In KM)'] || '0') || 0;
  const totalDamagedLength = damagedDLP + damagedNonDLP + damagedWIP;
  const damagedPercentage = totalLength > 0 ? ((totalDamagedLength / totalLength) * 100).toFixed(2) : '0.00';

  const repairedDLP = parseFloat(road[findKey('પેવરપટ્ટાકરેલલંબાઇ(DLP-Major)(d)')] || '0') || 0;
  const repairedDLPMinor = parseFloat(road[findKey('DLPમાઇનરપેચવર્કકરેલલંબાઇ(e)')] || '0') || 0;
  const repairedNonDLP = parseFloat(road[findKey('પેવરપટ્ટાકરેલલંબાઇ(NonDLP-Major)(d)')] || '0') || 0;
  const repairedNonDLPMinor = parseFloat(road[findKey('NonDLPમાઇનરપેચવર્કકરેલલંબાઇ(e)')] || '0') || 0;
  const totalRepairedLength = repairedDLP + repairedDLPMinor + repairedNonDLP + repairedNonDLPMinor;
  const repairedPercentage = totalDamagedLength > 0 ? ((totalRepairedLength / totalDamagedLength) * 100).toFixed(2) : '0.00';

  const unattainedLength = totalDamagedLength - totalRepairedLength;
  const unattainedPercentage = totalDamagedLength > 0 ? ((unattainedLength / totalDamagedLength) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors text-slate-600 shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">{road['Road Name with Chainages'] || 'Road Details'}</h2>
          <div className="mt-2 flex flex-wrap gap-2 sm:gap-4 text-xs font-medium">
            <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100">
              <span className="font-bold">Damaged:</span> {damagedPercentage}% ({totalDamagedLength.toFixed(2)} KM)
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
              <span className="font-bold">Repaired:</span> {repairedPercentage}% ({totalRepairedLength.toFixed(2)} KM)
            </div>
            <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100">
              <span className="font-bold">Unattained:</span> {unattainedPercentage}% ({unattainedLength.toFixed(2)} KM)
            </div>
          </div>
        </div>
      </div>

      <Section title="Summary of Road" data={summaryDetails} />
      <Section title="Basic Road Details" data={basicDetails} />
      <Section title="Road DLP Details" data={dlpDetails} />
      <Section title="Road Non-DLP Details" data={nonDlpDetails} />
      <Section title="Road WIP Details" data={wipDetails} />
      <Section title="Road Structure Details" data={structureDetails} />
    </div>
  );
};

const StructureDetailsView = ({ structure, roadName, onBack }: { structure: any, roadName: string, onBack: () => void }) => {
  const keys = Object.keys(structure);
  const findKey = (searchStr: string) => {
    const normalizedSearch = searchStr.replace(/\s+/g, '').toLowerCase();
    return keys.find(k => k.replace(/\s+/g, '').toLowerCase().includes(normalizedSearch)) || searchStr;
  };

  const strType = structure['Structure Type'] || structure['Structure_Type'] || structure['Type'] || 'N/A';

  const firstSegment = [
    { label: 'Str_Unique_ID', value: structure['Str_Unique_ID'] || structure['Str Unique ID'] || structure['id'] },
    { label: 'Road Name', value: roadName },
    { label: 'Structure_Type', value: strType },
    { label: 'Chainage', value: structure['Chainage'] },
    { label: 'LatLong', value: structure['LatLong'] || structure['Lat Long'] || structure['Coordinates'] },
    { label: 'Visited ?', value: structure['Visited ?'] || structure['Visited'] },
    { label: 'Visited Date', value: structure['Visited Date'] || structure['Date Visited'] },
    { label: 'Condition', value: structure['Condition'] }
  ];

  const secondSegment = [
    { label: 'Const. Year', value: structure['Const. Year'] || structure['Construction Year'] },
    { label: 'Bridge Name', value: structure['Bridge Name'] },
    { label: 'River/Canal/Natural Drain Name', value: structure[findKey('River/Canal/Natural Drain Name')] || structure['River Name'] },
    { label: 'Length (Mt.)', value: structure[findKey('Length (Mt.)')] || structure['Length'] },
    { label: 'Carriage Way (Mt.)', value: structure[findKey('Carriage Way (Mt.)')] || structure['Carriage Way'] }
  ];

  const lastSegment = [
    { label: 'Bridge Configuration (Span details, Type of Super Structure, Type of Sub Structure, High Level/ Low Level, etc)', value: structure[findKey('Bridge Configuration (Span details, Type of Super Structure, Type of Sub Structure, High Level/ Low Level, etc)')] || structure['Bridge Configuration'] },
    { label: 'Defect Details (In Short) If Any', value: structure[findKey('Defect Details (In Short) If Any')] || structure['Defect Details'] },
    { label: 'Action Taken Report ( કરેલ કામગીરીની વિગતો)', value: structure[findKey('In Case Critical or Poor Bridge, Action Taken Report ( કરેલ કામગીરીની વિગતો)')] || structure['Action Taken Report'] }
  ];

  const Section = ({ title, data }: { title: string, data: any[] }) => {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-xs font-medium text-slate-500 break-words">{item.label}</p>
              <p className="text-sm font-semibold text-slate-900 break-words">{item.value || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors text-slate-600 shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">{structure['Bridge Name'] || structure['Str_Unique_ID'] || 'Structure Details'}</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">{roadName} • {strType}</p>
        </div>
      </div>

      <Section title="Primary Details" data={firstSegment} />
      <Section title="Technical Specifications" data={secondSegment} />
      <Section title="Configuration & Condition" data={lastSegment} />
    </div>
  );
};

const CustomRoadCategoryChart = ({ data, onCategoryClick }: { data: any[], onCategoryClick: (category: string) => void }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  const getIcon = (name: string) => {
    switch (name) {
      case 'NH': return <MapIcon size={24} className="text-blue-500" />;
      case 'SH': return <Route size={24} className="text-orange-500" />;
      case 'MDR': return <Navigation size={24} className="text-teal-700" />;
      case 'ODR': return <Signpost size={24} className="text-amber-500" />;
      case 'VR': return <Milestone size={24} className="text-emerald-600" />;
      case 'CH': return <Compass size={24} className="text-purple-500" />;
      case 'SHDP': return <Activity size={24} className="text-pink-500" />;
      case 'BYPASS': return <Car size={24} className="text-green-500" />;
      case 'SH OLD': return <MapPin size={24} className="text-rose-500" />;
      default: return <Route size={24} className="text-slate-400" />;
    }
  };

  const getPattern = (name: string) => {
    switch (name) {
      case 'MDR': return 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)';
      case 'SH': return 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)';
      case 'ODR': return 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)';
      case 'VR': return 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)';
      default: return 'none';
    }
  };

  const getBackgroundSize = (name: string) => {
    switch (name) {
      case 'SH': return '8px 8px';
      case 'VR': return '20px 20px';
      default: return 'auto';
    }
  };

  return (
    <div className="relative w-full h-full overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '400px' }}>
      {/* Decorative background element */}
      <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 pointer-events-none flex flex-col justify-between py-4">
        <Route size={120} className="text-slate-900 -mr-10 transform rotate-12" />
        <Construction size={80} className="text-slate-900 -mr-4 transform -rotate-12" />
      </div>

      <div className="space-y-4 relative z-10 py-2">
        {data.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-4 group cursor-pointer"
            onClick={() => onCategoryClick(item.name)}
          >
            <div className="w-40 sm:w-56 shrink-0 flex items-center justify-end gap-3 border-r-2 border-slate-300 pr-4 py-1 relative">
              <div className="flex flex-col items-end text-right">
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{item.fullName}</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">({item.name})</span>
              </div>
              <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                {getIcon(item.name)}
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div 
                className="h-8 sm:h-10 rounded-r-md relative overflow-hidden transition-all duration-500 ease-out group-hover:opacity-90 shadow-sm" 
                style={{ width: `${Math.max((item.value / maxValue) * 100, 2)}%`, backgroundColor: item.color }}
              >
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    backgroundImage: getPattern(item.name),
                    backgroundSize: getBackgroundSize(item.name)
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 whitespace-nowrap">{item.value.toLocaleString()} KM</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomLengthDistributionChart = ({ breakdowns }: { breakdowns: any }) => {
  const categories = [
    { id: 'dlp', name: 'DLP (Defect Liability Period)', data: breakdowns.dlp, color: 'emerald', bg: 'bg-emerald-200', text: 'text-emerald-800', title: 'text-emerald-700' },
    { id: 'nondlp', name: 'Non-DLP', data: breakdowns.nonDlp, color: 'amber', bg: 'bg-amber-200', text: 'text-amber-800', title: 'text-amber-700' },
    { id: 'wip', name: 'WIP (Work In Progress)', data: breakdowns.wip, color: 'blue', bg: 'bg-blue-200', text: 'text-blue-800', title: 'text-blue-700' },
    { id: 'total', name: 'Total Roads Length', data: breakdowns.total, color: 'indigo', bg: 'bg-indigo-200', text: 'text-indigo-800', title: 'text-indigo-700' }
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-4">
      {categories.map(cat => {
        const total = cat.data.total || 1; // prevent div by zero
        const pRepaired = (cat.data.repaired / total) * 100;
        const pUnattained = (cat.data.unattained / total) * 100;
        const pIntact = (cat.data.intact / total) * 100;

        return (
          <div key={cat.id} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
              <div>
                <h4 className={`text-lg font-bold ${cat.title}`}>{cat.name}</h4>
                <p className="text-sm text-slate-500 font-bold mt-1">Total Length: {cat.data.total.toFixed(2)} KM</p>
              </div>
              <div className="flex gap-4 sm:gap-8 text-xs sm:text-sm font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex flex-col items-center sm:items-end">
                  <span className="text-emerald-600 uppercase tracking-wider text-[10px] sm:text-xs mb-1">Repaired</span>
                  <span className="text-slate-800">{cat.data.repaired.toFixed(2)} KM</span>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="flex flex-col items-center sm:items-end">
                  <span className="text-red-500 uppercase tracking-wider text-[10px] sm:text-xs mb-1">Unattained</span>
                  <span className="text-slate-800">{cat.data.unattained.toFixed(2)} KM</span>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="flex flex-col items-center sm:items-end">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] sm:text-xs mb-1">Intact</span>
                  <span className="text-slate-800">{cat.data.intact.toFixed(2)} KM</span>
                </div>
              </div>
            </div>
            
            {/* The Bar */}
            <div className="h-8 sm:h-10 w-full bg-slate-100 rounded-xl overflow-hidden flex shadow-inner relative">
              {/* Tooltips/Labels on hover are handled by group-hover inside each segment */}
              <div 
                className="bg-emerald-500 h-full transition-all duration-1000 ease-out relative group cursor-help border-r border-white/20"
                style={{ width: `${pRepaired}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]"></div>
                {pRepaired > 5 && <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">{pRepaired.toFixed(1)}%</span>}
              </div>
              <div 
                className="bg-red-500 h-full transition-all duration-1000 ease-out relative group cursor-help border-r border-white/20"
                style={{ width: `${pUnattained}%` }}
              >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,255,255,0.1)_5px,rgba(255,255,255,0.1)_10px)]"></div>
                {pUnattained > 5 && <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">{pUnattained.toFixed(1)}%</span>}
              </div>
              <div 
                className={`${cat.bg} h-full transition-all duration-1000 ease-out relative group cursor-help`}
                style={{ width: `${pIntact}%` }}
              >
                {pIntact > 5 && <span className={`absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold ${cat.text} opacity-0 group-hover:opacity-100 transition-opacity`}>{pIntact.toFixed(1)}%</span>}
              </div>
            </div>
            
            {/* Legend for this specific bar */}
            <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Repaired</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Unattained</div>
              <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${cat.bg}`}></div> Intact</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const RoadsDashboard: React.FC<RoadsDashboardProps> = ({ data, structureData = [], selectedDivision, onDetailViewChange, resetViewTrigger }) => {
  const [activeDetailView, setActiveDetailView] = useState<'total' | 'wip' | 'dlp' | 'nondlp' | 'structures' | string | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<any | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<any | null>(null);
  const [roadSearchTerm, setRoadSearchTerm] = useState('');
  const [structureCategoryFilter, setStructureCategoryFilter] = useState<string>('Major Bridge');

  const roadMap = useMemo(() => {
    const map = new Map();
    data.forEach(road => {
      const id = road['Road_ID'] || road['Road ID'] || road['road_id'];
      if (id) {
        map.set(String(id), road['Road Name with Chainages'] || road['Road Name']);
      }
    });
    return map;
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedDivision === 'RC2') return data;
    return data.filter(row => {
      const div = String(row['Division'] || '').trim().toLowerCase();
      return div.includes(selectedDivision.toLowerCase());
    });
  }, [data, selectedDivision]);

  const structureCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const validRoadIds = new Set(filteredData.map(r => String(r['Road_ID'] || r['Road ID'] || r['road_id'])));
    
    structureData.forEach(s => {
      const roadId = String(s['Road_ID'] || s['Road ID'] || s['road_id']);
      if (validRoadIds.has(roadId)) {
        const type = s['Structure Type'] || s['Structure_Type'] || s['Type'] || 'Other';
        counts[type] = (counts[type] || 0) + 1;
      }
    });
    return counts;
  }, [structureData, filteredData]);

  const totalStructuresCount = useMemo(() => {
    return Object.values(structureCategoryCounts).reduce((a: number, b: number) => a + b, 0);
  }, [structureCategoryCounts]);

  React.useEffect(() => {
    if (resetViewTrigger && resetViewTrigger > 0) {
      setActiveDetailView(null);
      setSelectedRoad(null);
      setSelectedStructure(null);
      setRoadSearchTerm('');
    }
  }, [resetViewTrigger]);

  React.useEffect(() => {
    if (onDetailViewChange) {
      onDetailViewChange(!!activeDetailView || !!selectedRoad || !!selectedStructure);
    }
  }, [activeDetailView, selectedRoad, selectedStructure, onDetailViewChange]);

  const stats = useMemo(() => {
    let totalRoads = 0;
    let totalLength = 0;
    let totalDlp = 0;
    let totalNonDlp = 0;
    let totalWip = 0;
    let totalStructures = 0;

    let dlpDamaged = 0;
    let dlpRepaired = 0;
    
    let nonDlpDamaged = 0;
    let nonDlpRepaired = 0;

    let wipDamaged = 0;

    const findKeyInRow = (row: any, searchStr: string) => {
      const keys = Object.keys(row);
      const normalizedSearch = searchStr.replace(/\s+/g, '').toLowerCase();
      return keys.find(k => k.replace(/\s+/g, '').toLowerCase().includes(normalizedSearch)) || searchStr;
    };

    const categoryLengths: Record<string, number> = {
      'SH': 0, 'MDR': 0, 'CH': 0, 'VR': 0, 'SHDP': 0, 'BYPASS': 0, 'NH': 0, 'ODR': 0, 'SH OLD': 0
    };

    filteredData.forEach(row => {
      if (!row['Road Name with Chainages']) return;
      totalRoads++;
      
      const keys = Object.keys(row);
      for (let i = 65; i <= 70; i++) {
        if (keys[i]) {
          totalStructures += parseFloat(row[keys[i]] || '0') || 0;
        }
      }

      const length = parseFloat(row['રસ્તાની કુલ લંબાઇ'] || '0') || 0;
      totalLength += length;
      
      const dlpLen = parseFloat(row['DLP Length (In KM)'] || '0') || 0;
      const nonDlpLen = parseFloat(row['Non DLP Length (In KM)'] || '0') || 0;
      const wipLen = parseFloat(row['WIP Length (In KM)'] || '0') || 0;

      totalDlp += dlpLen;
      totalNonDlp += nonDlpLen;
      totalWip += wipLen;

      dlpDamaged += parseFloat(row[findKeyInRow(row, 'મરામતકરવાપાત્રલંબાઇ=a+b(DLP)')] || '0') || 0;
      dlpRepaired += (parseFloat(row[findKeyInRow(row, 'પેવરપટ્ટાકરેલલંબાઇ(DLP-Major)(d)')] || '0') || 0) + (parseFloat(row[findKeyInRow(row, 'DLPમાઇનરપેચવર્કકરેલલંબાઇ(e)')] || '0') || 0);

      nonDlpDamaged += parseFloat(row[findKeyInRow(row, 'મરામતકરવાપાત્રલંબાઇ=a+b(NonDLP)')] || '0') || 0;
      nonDlpRepaired += (parseFloat(row[findKeyInRow(row, 'પેવરપટ્ટાકરેલલંબાઇ(NonDLP-Major)(d)')] || '0') || 0) + (parseFloat(row[findKeyInRow(row, 'NonDLPમાઇનરપેચવર્કકરેલલંબાઇ(e)')] || '0') || 0);

      wipDamaged += parseFloat(row[findKeyInRow(row, 'મરામતબાકીરહેલલંબાઇ(WIP)')] || row['WIP Length (In KM)'] || '0') || 0;

      const category = String(row['Road Category'] || '').toUpperCase().trim();
      if (categoryLengths[category] !== undefined) {
        categoryLengths[category] += length;
      } else if (category) {
        categoryLengths[category] = (categoryLengths[category] || 0) + length;
      }
    });

    const CATEGORY_INFO: Record<string, { fullName: string, color: string }> = {
      'MDR': { fullName: 'Major District Roads', color: '#1e5b6e' },
      'SH': { fullName: 'State Highways', color: '#e05a33' },
      'ODR': { fullName: 'Other District Roads', color: '#dcae53' },
      'VR': { fullName: 'Village Roads', color: '#4a8fa3' },
      'CH': { fullName: 'Coastal Highways', color: '#8b5cf6' },
      'SHDP': { fullName: 'SHDP', color: '#ec4899' },
      'BYPASS': { fullName: 'Bypass Roads', color: '#10b981' },
      'NH': { fullName: 'National Highways', color: '#3b82f6' },
      'SH OLD': { fullName: 'State Highways (Old)', color: '#f43f5e' }
    };

    const categories = Object.entries(categoryLengths)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        fullName: CATEGORY_INFO[name]?.fullName || name,
        value: parseFloat(value.toFixed(2)),
        color: CATEGORY_INFO[name]?.color || '#94a3b8'
      }))
      .sort((a, b) => b.value - a.value);

    const dlpUnattained = Math.max(0, dlpDamaged - dlpRepaired);
    const dlpIntact = Math.max(0, totalDlp - dlpDamaged);

    const nonDlpUnattained = Math.max(0, nonDlpDamaged - nonDlpRepaired);
    const nonDlpIntact = Math.max(0, totalNonDlp - nonDlpDamaged);

    const wipUnattained = wipDamaged;
    const wipIntact = Math.max(0, totalWip - wipDamaged);

    return {
      totalRoads,
      totalStructures,
      totalLength: totalLength.toFixed(2),
      totalDlp: totalDlp.toFixed(2),
      totalNonDlp: totalNonDlp.toFixed(2),
      totalWip: totalWip.toFixed(2),
      categories,
      lengths: [
        { name: 'DLP', value: parseFloat(totalDlp.toFixed(2)), color: '#10b981' },
        { name: 'Non-DLP', value: parseFloat(totalNonDlp.toFixed(2)), color: '#f59e0b' },
        { name: 'WIP', value: parseFloat(totalWip.toFixed(2)), color: '#3b82f6' },
      ],
      breakdowns: {
        dlp: { total: totalDlp, repaired: dlpRepaired, unattained: dlpUnattained, intact: dlpIntact },
        nonDlp: { total: totalNonDlp, repaired: nonDlpRepaired, unattained: nonDlpUnattained, intact: nonDlpIntact },
        wip: { total: totalWip, repaired: 0, unattained: wipUnattained, intact: wipIntact },
        total: { 
          total: totalLength, 
          repaired: dlpRepaired + nonDlpRepaired, 
          unattained: dlpUnattained + nonDlpUnattained + wipUnattained, 
          intact: Math.max(0, totalLength - (dlpRepaired + nonDlpRepaired) - (dlpUnattained + nonDlpUnattained + wipUnattained)) 
        }
      }
    };
  }, [filteredData]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500">No network data available.</p>
      </div>
    );
  }

  if (selectedRoad) {
    return <RoadDetailsView road={selectedRoad} onBack={() => setSelectedRoad(null)} />;
  }

  if (selectedStructure) {
    const roadName = roadMap.get(String(selectedStructure['Road_ID'] || selectedStructure['Road ID'] || selectedStructure['road_id'])) || selectedStructure['Road Name'] || selectedStructure['Road_Name'] || 'Unknown Road';
    return <StructureDetailsView structure={selectedStructure} roadName={roadName} onBack={() => setSelectedStructure(null)} />;
  }

  if (activeDetailView) {
    let title = "Road Network Details";
    let displayedData = filteredData;

    if (activeDetailView === 'wip') {
      title = "WIP Road Details";
      displayedData = filteredData.filter(row => parseFloat(row['WIP Length (In KM)'] || '0') > 0);
    } else if (activeDetailView === 'dlp') {
      title = "DLP Road Details";
      displayedData = filteredData.filter(row => parseFloat(row['DLP Length (In KM)'] || '0') > 0);
    } else if (activeDetailView === 'nondlp') {
      title = "Non-DLP Road Details";
      displayedData = filteredData.filter(row => parseFloat(row['Non DLP Length (In KM)'] || '0') > 0);
    } else if (activeDetailView === 'structures') {
      title = "Road Structure Details";
      
      // Get valid road IDs in the current division
      const validRoadIds = new Set(filteredData.map(r => String(r['Road_ID'] || r['Road ID'] || r['road_id'])));
      
      // Filter structure data by these road IDs
      displayedData = structureData.filter(s => {
        const roadId = String(s['Road_ID'] || s['Road ID'] || s['road_id']);
        const matchesRoad = validRoadIds.has(roadId);
        const type = s['Structure Type'] || s['Structure_Type'] || s['Type'] || 'Other';
        const matchesCategory = structureCategoryFilter === 'All' || type === structureCategoryFilter;
        
        let matchesSearch = true;
        if (roadSearchTerm) {
          const rName = (roadMap.get(roadId) || s['Road Name'] || s['Road_Name'] || '').toLowerCase();
          const strId = String(s['Str_Unique_ID'] || s['Str Unique ID'] || '').toLowerCase();
          const bName = String(s['Bridge Name'] || '').toLowerCase();
          matchesSearch = rName.includes(roadSearchTerm.toLowerCase()) || 
                          strId.includes(roadSearchTerm.toLowerCase()) ||
                          bName.includes(roadSearchTerm.toLowerCase());
        }

        return matchesRoad && matchesCategory && matchesSearch;
      });
    } else if (activeDetailView && !['total', 'wip', 'dlp', 'nondlp', 'structures'].includes(activeDetailView)) {
      title = `${activeDetailView} Road Details`;
      displayedData = filteredData.filter(row => String(row['Road Category'] || '').toUpperCase().trim() === activeDetailView);
    }

    const findKeyInRow = (row: any, searchStr: string) => {
      const keys = Object.keys(row);
      const normalizedSearch = searchStr.replace(/\s+/g, '').toLowerCase();
      return keys.find(k => k.replace(/\s+/g, '').toLowerCase().includes(normalizedSearch)) || searchStr;
    };

    if (activeDetailView === 'total' && roadSearchTerm) {
      displayedData = displayedData.filter(row => {
        const roadName = String(row['Road Name with Chainages'] || '').toLowerCase();
        return roadName.includes(roadSearchTerm.toLowerCase());
      });
    }

    // Calculate unattained length for each row to sort them
    const dataWithUnattained = displayedData.map(row => {
      // If we are in structures view, we are dealing with structure objects, not road objects
      if (activeDetailView === 'structures') {
        return { ...row, _unattained: 0, _tDamaged: 0, _tRepaired: 0, _totalStructures: 0 };
      }

      const dDLP = parseFloat(row[findKeyInRow(row, 'મરામતકરવાપાત્રલંબાઇ=a+b(DLP)')] || '0') || 0;
      const dNonDLP = parseFloat(row[findKeyInRow(row, 'મરામતકરવાપાત્રલંબાઇ=a+b(NonDLP)')] || '0') || 0;
      const dWIP = parseFloat(row[findKeyInRow(row, 'મરામતબાકીરહેલલંબાઇ(WIP)')] || row['WIP Length (In KM)'] || '0') || 0;
      const tDamaged = dDLP + dNonDLP + dWIP;

      const rDLP = parseFloat(row[findKeyInRow(row, 'પેવરપટ્ટાકરેલલંબાઇ(DLP-Major)(d)')] || '0') || 0;
      const rDLPMinor = parseFloat(row[findKeyInRow(row, 'DLPમાઇનરપેચવર્કકરેલલંબાઇ(e)')] || '0') || 0;
      const rNonDLP = parseFloat(row[findKeyInRow(row, 'પેવરપટ્ટાકરેલલંબાઇ(NonDLP-Major)(d)')] || '0') || 0;
      const rNonDLPMinor = parseFloat(row[findKeyInRow(row, 'NonDLPમાઇનરપેચવર્કકરેલલંબાઇ(e)')] || '0') || 0;
      const tRepaired = rDLP + rDLPMinor + rNonDLP + rNonDLPMinor;

      const unattained = tDamaged - tRepaired;

      let tStructures = 0;
      const keys = Object.keys(row);
      for (let i = 65; i <= 70; i++) {
        if (keys[i]) {
          tStructures += parseFloat(row[keys[i]] || '0') || 0;
        }
      }

      return { ...row, _unattained: unattained, _tDamaged: tDamaged, _tRepaired: tRepaired, _totalStructures: tStructures };
    });

    // Sort descending by unattained length
    if (activeDetailView !== 'structures') {
      dataWithUnattained.sort((a, b) => b._unattained - a._unattained);
    }
    
    displayedData = dataWithUnattained;

    let aggTotalLength = 0;
    let aggDamagedLength = 0;
    let aggRepairedLength = 0;
    let aggTotalStructures = displayedData.length;

    displayedData.forEach(row => {
      if (activeDetailView !== 'structures') {
        const tLen = parseFloat(row['રસ્તાની કુલ લંબાઇ'] || '0') || 0;
        aggTotalLength += tLen;
        aggDamagedLength += row._tDamaged;
        aggRepairedLength += row._tRepaired;
      }
    });

    const aggUnattainedLength = aggDamagedLength - aggRepairedLength;
    const aggDamagedPct = aggTotalLength > 0 ? ((aggDamagedLength / aggTotalLength) * 100).toFixed(2) : '0.00';
    const aggRepairedPct = aggDamagedLength > 0 ? ((aggRepairedLength / aggDamagedLength) * 100).toFixed(2) : '0.00';
    const aggUnattainedPct = aggDamagedLength > 0 ? ((aggUnattainedLength / aggDamagedLength) * 100).toFixed(2) : '0.00';

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-slate-100 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => {
                    setActiveDetailView(null);
                    setRoadSearchTerm('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900 shrink-0"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                  {activeDetailView === 'structures' ? (
                    <p className="text-xs font-medium text-slate-500">Showing individual structure details</p>
                  ) : (
                    <p className="text-xs font-medium text-slate-500">{displayedData.length} Roads • {aggTotalLength.toFixed(2)} KM Total</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs font-medium">
                {activeDetailView === 'structures' ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {Object.entries(structureCategoryCounts).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([cat, count]) => (
                      <button
                        key={cat}
                        onClick={() => setStructureCategoryFilter(cat)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border transition-all font-bold",
                          structureCategoryFilter === cat 
                            ? "bg-purple-600 text-white border-purple-600 shadow-sm" 
                            : "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"
                        )}
                      >
                        {cat} : {count}
                      </button>
                    ))}
                    <button
                      onClick={() => setStructureCategoryFilter('All')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border transition-all font-bold",
                        structureCategoryFilter === 'All' 
                          ? "bg-slate-700 text-white border-slate-700 shadow-sm" 
                          : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                      )}
                    >
                      Total Structure : {totalStructuresCount}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100">
                      <span className="font-bold">Damaged:</span> {aggDamagedPct}% ({aggDamagedLength.toFixed(2)} KM)
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <span className="font-bold">Repaired:</span> {aggRepairedPct}% ({aggRepairedLength.toFixed(2)} KM)
                    </div>
                    <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100">
                      <span className="font-bold">Unattained:</span> {aggUnattainedPct}% ({aggUnattainedLength.toFixed(2)} KM)
                    </div>
                  </>
                )}
              </div>
            </div>
            {(activeDetailView === 'total' || activeDetailView === 'structures') && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder={activeDetailView === 'structures' ? "Search structure, road or ID..." : "Search road name..."} 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={roadSearchTerm}
                  onChange={(e) => setRoadSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Road Name</th>
                  {activeDetailView !== 'structures' && (
                    <>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total Length (KM)</th>
                    </>
                  )}
                  {activeDetailView === 'total' && (
                    <>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">DLP (KM)</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Non-DLP (KM)</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">WIP (KM)</th>
                    </>
                  )}
                  {activeDetailView === 'wip' && <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">WIP (KM)</th>}
                  {activeDetailView === 'dlp' && <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">DLP (KM)</th>}
                  {activeDetailView === 'nondlp' && <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Non-DLP (KM)</th>}
                  {activeDetailView === 'structures' && (
                    <>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Structure Type</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Chainage</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Condition</th>
                    </>
                  )}
                  {activeDetailView !== 'total' && activeDetailView !== 'structures' && (
                    <>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Damaged (KM)</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Repaired (KM)</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Unattained (KM)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedData.map((row, idx) => {
                  const roadName = activeDetailView === 'structures' 
                    ? (roadMap.get(String(row['Road_ID'] || row['Road ID'] || row['road_id'])) || row['Road Name'] || row['Road_Name'] || 'Unknown Road')
                    : (row['Road Name with Chainages'] || 'N/A');

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td 
                        className="p-4 text-sm font-semibold text-indigo-600 max-w-xs truncate cursor-pointer hover:underline" 
                        title={roadName}
                        onClick={() => {
                          if (activeDetailView === 'structures') {
                            // Find the road object in data to show details
                            const roadId = String(row['Road_ID'] || row['Road ID'] || row['road_id']);
                            const roadObj = data.find(r => String(r['Road_ID'] || r['Road ID'] || r['road_id']) === roadId);
                            if (roadObj) setSelectedRoad(roadObj);
                          } else {
                            setSelectedRoad(row);
                          }
                        }}
                      >
                        {roadName}
                      </td>
                      {activeDetailView !== 'structures' && (
                        <>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">
                              {row['Road Category'] || 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-600 font-medium">
                            {parseFloat(row['રસ્તાની કુલ લંબાઇ'] || '0').toFixed(2)}
                          </td>
                        </>
                      )}
                      {activeDetailView === 'total' && (
                        <>
                          <td className="p-4 text-sm text-emerald-600 font-medium">{row['DLP Length (In KM)'] || '0'}</td>
                          <td className="p-4 text-sm text-amber-600 font-medium">{row['Non DLP Length (In KM)'] || '0'}</td>
                          <td className="p-4 text-sm text-blue-600 font-medium">{row['WIP Length (In KM)'] || '0'}</td>
                        </>
                      )}
                      {activeDetailView === 'wip' && <td className="p-4 text-sm text-blue-600 font-medium">{row['WIP Length (In KM)'] || '0'}</td>}
                      {activeDetailView === 'dlp' && <td className="p-4 text-sm text-emerald-600 font-medium">{row['DLP Length (In KM)'] || '0'}</td>}
                      {activeDetailView === 'nondlp' && <td className="p-4 text-sm text-amber-600 font-medium">{row['Non DLP Length (In KM)'] || '0'}</td>}
                      {activeDetailView === 'structures' && (
                        <>
                          <td className="p-4">
                            <span 
                              onClick={() => setSelectedStructure(row)}
                              className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-md uppercase cursor-pointer hover:bg-purple-100 hover:shadow-sm transition-all"
                            >
                              {row['Structure Type'] || row['Structure_Type'] || row['Type'] || 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-600 font-medium">{row['Chainage'] || 'N/A'}</td>
                          <td className="p-4 text-sm text-purple-600 font-medium">{row['Condition'] || 'N/A'}</td>
                        </>
                      )}
                      {activeDetailView !== 'total' && activeDetailView !== 'structures' && (
                        <>
                          <td className="p-4 text-sm text-red-600 font-medium">{row._tDamaged.toFixed(2)}</td>
                          <td className="p-4 text-sm text-emerald-600 font-medium">{row._tRepaired.toFixed(2)}</td>
                          <td className="p-4 text-sm text-amber-600 font-medium">{row._unattained.toFixed(2)}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Roads" 
          value={stats.totalRoads} 
          icon={Route} 
          color="bg-indigo-500" 
          onClick={() => setActiveDetailView('total')}
          extra={<p className="text-sm font-semibold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded-md mt-1">Length: {stats.totalLength} KM</p>}
        />
        <StatCard 
          title="WIP Length (KM)" 
          value={stats.totalWip} 
          icon={Activity} 
          color="bg-blue-500" 
          onClick={() => setActiveDetailView('wip')}
        />
        <StatCard 
          title="DLP Length (KM)" 
          value={stats.totalDlp} 
          icon={ShieldCheck} 
          color="bg-emerald-500" 
          onClick={() => setActiveDetailView('dlp')}
        />
        <StatCard 
          title="Non-DLP Length (KM)" 
          value={stats.totalNonDlp} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
          onClick={() => setActiveDetailView('nondlp')}
        />
        <StatCard 
          title="Structures" 
          value={stats.totalStructures} 
          icon={Construction} 
          color="bg-purple-500" 
          onClick={() => setActiveDetailView('structures')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Road Categories</h3>
          <div className="h-[400px]">
            <CustomRoadCategoryChart 
              data={stats.categories} 
              onCategoryClick={(cat) => setActiveDetailView(cat)}
            />
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Length Distribution (KM)</h3>
          <CustomLengthDistributionChart breakdowns={stats.breakdowns} />
        </section>
      </div>
    </div>
  );
};
