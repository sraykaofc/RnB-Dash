import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Route, ShieldCheck, AlertTriangle, Construction, Activity, ArrowLeft, Search, Map, Navigation, Signpost, Milestone, Compass, Car } from 'lucide-react';
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

const CustomRoadCategoryChart = ({ data }: { data: any[] }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  const getIcon = (name: string) => {
    switch (name) {
      case 'NH': return <Map size={24} className="text-blue-500" />;
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
          <div key={idx} className="flex items-center gap-4 group">
            <div className="w-40 sm:w-56 shrink-0 flex items-center justify-end gap-3 border-r-2 border-slate-300 pr-4 py-1 relative">
              <div className="flex flex-col items-end text-right">
                <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">{item.fullName}</span>
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

export const RoadsDashboard: React.FC<RoadsDashboardProps> = ({ data, selectedDivision, onDetailViewChange, resetViewTrigger }) => {
  const [activeDetailView, setActiveDetailView] = useState<'total' | 'wip' | 'dlp' | 'nondlp' | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<any | null>(null);
  const [roadSearchTerm, setRoadSearchTerm] = useState('');

  React.useEffect(() => {
    if (resetViewTrigger && resetViewTrigger > 0) {
      setActiveDetailView(null);
      setSelectedRoad(null);
      setRoadSearchTerm('');
    }
  }, [resetViewTrigger]);

  React.useEffect(() => {
    if (onDetailViewChange) {
      onDetailViewChange(!!activeDetailView || !!selectedRoad);
    }
  }, [activeDetailView, selectedRoad, onDetailViewChange]);

  const filteredData = useMemo(() => {
    if (selectedDivision === 'RC2') return data;
    return data.filter(row => {
      const div = String(row['Division'] || '').trim().toLowerCase();
      return div.includes(selectedDivision.toLowerCase());
    });
  }, [data, selectedDivision]);

  const stats = useMemo(() => {
    let totalRoads = 0;
    let totalLength = 0;
    let totalDlp = 0;
    let totalNonDlp = 0;
    let totalWip = 0;

    const categoryLengths: Record<string, number> = {
      'SH': 0, 'MDR': 0, 'CH': 0, 'VR': 0, 'SHDP': 0, 'BYPASS': 0, 'NH': 0, 'ODR': 0, 'SH OLD': 0
    };

    filteredData.forEach(row => {
      if (!row['Road Name with Chainages']) return;
      totalRoads++;
      
      const length = parseFloat(row['રસ્તાની કુલ લંબાઇ'] || '0') || 0;
      totalLength += length;
      totalDlp += parseFloat(row['DLP Length (In KM)'] || '0') || 0;
      totalNonDlp += parseFloat(row['Non DLP Length (In KM)'] || '0') || 0;
      totalWip += parseFloat(row['WIP Length (In KM)'] || '0') || 0;

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

    return {
      totalRoads,
      totalLength: totalLength.toFixed(2),
      totalDlp: totalDlp.toFixed(2),
      totalNonDlp: totalNonDlp.toFixed(2),
      totalWip: totalWip.toFixed(2),
      categories,
      lengths: [
        { name: 'DLP', value: parseFloat(totalDlp.toFixed(2)), color: '#10b981' },
        { name: 'Non-DLP', value: parseFloat(totalNonDlp.toFixed(2)), color: '#f59e0b' },
        { name: 'WIP', value: parseFloat(totalWip.toFixed(2)), color: '#3b82f6' },
      ]
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
      return { ...row, _unattained: unattained, _tDamaged: tDamaged, _tRepaired: tRepaired };
    });

    // Sort descending by unattained length
    dataWithUnattained.sort((a, b) => b._unattained - a._unattained);
    displayedData = dataWithUnattained;

    let aggTotalLength = 0;
    let aggDamagedLength = 0;
    let aggRepairedLength = 0;

    displayedData.forEach(row => {
      const tLen = parseFloat(row['રસ્તાની કુલ લંબાઇ'] || '0') || 0;
      aggTotalLength += tLen;
      aggDamagedLength += row._tDamaged;
      aggRepairedLength += row._tRepaired;
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
                  <p className="text-xs font-medium text-slate-500">{displayedData.length} Roads • {aggTotalLength.toFixed(2)} KM Total</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs font-medium">
                <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100">
                  <span className="font-bold">Damaged:</span> {aggDamagedPct}% ({aggDamagedLength.toFixed(2)} KM)
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                  <span className="font-bold">Repaired:</span> {aggRepairedPct}% ({aggRepairedLength.toFixed(2)} KM)
                </div>
                <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100">
                  <span className="font-bold">Unattained:</span> {aggUnattainedPct}% ({aggUnattainedLength.toFixed(2)} KM)
                </div>
              </div>
            </div>
            {activeDetailView === 'total' && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search road name..." 
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
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total Length (KM)</th>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedData.map((row, idx) => {
                  if (!row['Road Name with Chainages']) return null;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td 
                        className="p-4 text-sm font-semibold text-indigo-600 max-w-xs truncate cursor-pointer hover:underline" 
                        title={row['Road Name with Chainages']}
                        onClick={() => setSelectedRoad(row)}
                      >
                        {row['Road Name with Chainages']}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">
                          {row['Road Category'] || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">{row['રસ્તાની કુલ લંબાઇ'] || '0'}</td>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Road Categories</h3>
          <div className="h-[400px]">
            <CustomRoadCategoryChart data={stats.categories} />
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Length Distribution (KM)</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.lengths}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.lengths.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="ml-8 space-y-4">
              {stats.lengths.map(item => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">{item.name}</p>
                    <p className="text-lg font-bold text-slate-900">{item.value} <span className="text-xs text-slate-400">KM</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
