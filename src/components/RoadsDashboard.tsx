import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Route, ShieldCheck, AlertTriangle, Construction, Activity } from 'lucide-react';
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
}

const StatCard = ({ title, value, icon: Icon, color, ringColor, description }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
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

export const RoadsDashboard: React.FC<RoadsDashboardProps> = ({ data, selectedDivision }) => {
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

    let shCount = 0;
    let mdrCount = 0;
    let odrCount = 0;
    let vrCount = 0;

    filteredData.forEach(row => {
      if (!row['Road Name with Chainages']) return;
      totalRoads++;
      
      totalLength += parseFloat(row['રસ્તાની કુલ લંબાઇ'] || '0') || 0;
      totalDlp += parseFloat(row['DLP Length (In KM)'] || '0') || 0;
      totalNonDlp += parseFloat(row['Non DLP Length (In KM)'] || '0') || 0;
      totalWip += parseFloat(row['WIP Length (In KM)'] || '0') || 0;

      const category = String(row['Road Category'] || '').toUpperCase();
      if (category === 'SH') shCount++;
      else if (category === 'MDR') mdrCount++;
      else if (category === 'ODR') odrCount++;
      else if (category === 'VR') vrCount++;
    });

    return {
      totalRoads,
      totalLength: totalLength.toFixed(2),
      totalDlp: totalDlp.toFixed(2),
      totalNonDlp: totalNonDlp.toFixed(2),
      totalWip: totalWip.toFixed(2),
      categories: [
        { name: 'SH', value: shCount, color: '#3b82f6' },
        { name: 'MDR', value: mdrCount, color: '#8b5cf6' },
        { name: 'ODR', value: odrCount, color: '#f59e0b' },
        { name: 'VR', value: vrCount, color: '#10b981' },
      ].filter(c => c.value > 0),
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Roads" 
          value={stats.totalRoads} 
          icon={Route} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Total Length (KM)" 
          value={stats.totalLength} 
          icon={Activity} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="DLP Length (KM)" 
          value={stats.totalDlp} 
          icon={ShieldCheck} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Non-DLP Length (KM)" 
          value={stats.totalNonDlp} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Road Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categories} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                  width={60}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {stats.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Road Network Details</h3>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
            {filteredData.length} Roads
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Road Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total Length (KM)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">DLP (KM)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Non-DLP (KM)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">WIP (KM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row, idx) => {
                if (!row['Road Name with Chainages']) return null;
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-800 max-w-xs truncate" title={row['Road Name with Chainages']}>
                      {row['Road Name with Chainages']}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">
                        {row['Road Category'] || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">{row['રસ્તાની કુલ લંબાઇ'] || '0'}</td>
                    <td className="p-4 text-sm text-emerald-600 font-medium">{row['DLP Length (In KM)'] || '0'}</td>
                    <td className="p-4 text-sm text-amber-600 font-medium">{row['Non DLP Length (In KM)'] || '0'}</td>
                    <td className="p-4 text-sm text-blue-600 font-medium">{row['WIP Length (In KM)'] || '0'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
