import React, { useMemo, useState, useEffect } from 'react';
import { getLeaveRecords } from '../services/dataService';
import { LEAVE_TYPES, LeaveRecord, Role } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Loader2, TrendingUp, Calendar, Users, Briefcase } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Alternating Cool/Warm colors for high contrast between adjacent months
const FRESH_COLORS = [
  '#3b82f6', // Oct - Blue (Cool)
  '#f97316', // Nov - Orange (Warm)
  '#06b6d4', // Dec - Cyan (Cool)
  '#ef4444', // Jan - Red (Warm)
  '#8b5cf6', // Feb - Violet (Cool)
  '#eab308', // Mar - Yellow (Warm)
  '#10b981', // Apr - Emerald (Cool)
  '#ec4899', // May - Pink (Warm)
  '#0ea5e9', // Jun - Sky (Cool)
  '#f59e0b', // Jul - Amber (Warm)
  '#6366f1', // Aug - Indigo (Cool)
  '#f43f5e', // Sep - Rose (Warm)
];

const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLeaveRecords();
      setRecords(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filter for Fiscal Year Oct 2568 (2025) - Sep 2569 (2026)
  const stats = useMemo(() => {
    const months = [
      'ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 
      'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'
    ];
    
    const monthMap: Record<number, number> = {
      9: 0, 10: 1, 11: 2, // Oct, Nov, Dec
      0: 3, 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11 // Jan - Sep
    };

    const monthlyData = months.map(m => ({ name: m, count: 0 }));
    const typeData: Record<string, number> = {};
    LEAVE_TYPES.forEach(t => typeData[t] = 0);

    records.forEach(record => {
      if (record.dates.length > 0) {
        const d = new Date(record.dates[0]);
        const mIndex = d.getMonth(); 
        const fiscalIndex = monthMap[mIndex];
        
        if (monthlyData[fiscalIndex]) {
            monthlyData[fiscalIndex].count += record.totalDays;
        }

        if (typeData[record.leaveType] !== undefined) {
          typeData[record.leaveType] += record.totalDays;
        }
      }
    });

    const pieData = Object.keys(typeData)
      .filter(key => typeData[key] > 0)
      .map(key => ({ name: key, value: typeData[key] }));

    return { monthlyData, pieData };
  }, [records]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-school-primary animate-spin" />
        <span className="ml-3 text-slate-500 font-medium">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            ภาพรวมสถิติการลา
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">ปีงบประมาณ 2569 (ต.ค. 68 - ก.ย. 69)</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
           <Briefcase className="w-4 h-4 text-slate-600" />
           <span className="text-slate-700 text-sm font-semibold">Dashboard</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-100 group hover:shadow-lg transition-all duration-300">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
             <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                   <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-sm">
                      <TrendingUp className="w-5 h-5" />
                   </div>
                   <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">การลาทั้งหมด</div>
                </div>
                <div className="text-4xl font-bold text-slate-800 mt-2">
                  {records.length} <span className="text-lg text-slate-400 font-normal">ครั้ง</span>
                </div>
             </div>
             <div className="mt-5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-full rounded-full"></div>
             </div>
          </div>
          
          {/* Card 2 */}
          <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-100 group hover:shadow-lg transition-all duration-300">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
             <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                   <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shadow-sm">
                      <Calendar className="w-5 h-5" />
                   </div>
                   <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">วันลาสะสมรวม</div>
                </div>
                <div className="text-4xl font-bold text-slate-800 mt-2">
                  {records.reduce((acc, curr) => acc + curr.totalDays, 0)} <span className="text-lg text-slate-400 font-normal">วัน</span>
                </div>
             </div>
             <div className="mt-5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-3/4 rounded-full"></div>
             </div>
          </div>
          
          {/* Card 3 */}
          <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-100 group hover:shadow-lg transition-all duration-300">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
             <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                   <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shadow-sm">
                      <Users className="w-5 h-5" />
                   </div>
                   <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">บุคลากรที่ลา</div>
                </div>
                <div className="text-4xl font-bold text-slate-800 mt-2">
                  {new Set(records.map(r => r.staffId)).size} <span className="text-lg text-slate-400 font-normal">คน</span>
                </div>
             </div>
             <div className="mt-5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-1/2 rounded-full"></div>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-bold text-slate-800 flex items-center">
               <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
               สถิติการลารายเดือน
             </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.monthlyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Bar dataKey="count" name="จำนวนวันลา" radius={[6, 6, 0, 0]} barSize={35}>
                  {stats.monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FRESH_COLORS[index % FRESH_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-bold text-slate-800 flex items-center">
               <span className="w-1.5 h-6 bg-pink-500 rounded-full mr-3"></span>
               สัดส่วนประเภทการลา
             </h3>
          </div>
          <div className="h-80 flex justify-center items-center">
             {stats.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={105}
                    innerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FRESH_COLORS[index % FRESH_COLORS.length]} stroke="#fff" strokeWidth={3} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle" 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '12px', color: '#475569' }}
                  />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <div className="flex flex-col items-center justify-center text-slate-300 h-full w-full bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <Calendar className="w-12 h-12 mb-2 opacity-50" />
                 <span>ยังไม่มีข้อมูลการลา</span>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;