import React, { useMemo, useState, useEffect } from 'react';
import { getLeaveRecords } from '../services/dataService';
import { LEAVE_TYPES, LeaveRecord } from '../types';
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
import { Loader2 } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
        <span className="ml-3 text-gray-500 font-medium">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ภาพรวมสถิติการลา (ปีงบประมาณ 2569)</h2>
          <p className="text-gray-500 text-sm">ข้อมูลเดือน ตุลาคม 2568 - กันยายน 2569</p>
        </div>
        <div className="mt-2 md:mt-0 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
           แดชบอร์ดผู้บริหาร
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50">
          <h3 className="text-lg font-semibold mb-6 text-indigo-900 border-l-4 border-indigo-500 pl-3">สถิติการลารายเดือน</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f5f3ff'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="count" name="จำนวนวันลา" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50">
          <h3 className="text-lg font-semibold mb-6 text-indigo-900 border-l-4 border-emerald-500 pl-3">สัดส่วนประเภทการลา</h3>
          <div className="h-80 flex justify-center items-center">
             {stats.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <div className="text-gray-400 text-center py-10 bg-gray-50 rounded-lg w-full">ยังไม่มีข้อมูลการลา</div>
             )}
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200 transform hover:-translate-y-1 transition-transform">
             <div className="text-blue-100 text-sm font-medium uppercase tracking-wider">การลาทั้งหมด</div>
             <div className="text-4xl font-bold mt-2">{records.length} <span className="text-lg font-normal opacity-80">ครั้ง</span></div>
             <div className="mt-4 h-1 bg-white/20 rounded-full w-full">
               <div className="h-1 bg-white/60 rounded-full w-3/4"></div>
             </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-sm border-b-4 border-b-amber-400">
             <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">วันลาสะสมรวม</div>
             <div className="text-4xl font-bold mt-2 text-gray-800">
               {records.reduce((acc, curr) => acc + curr.totalDays, 0)} <span className="text-lg font-normal text-gray-400">วัน</span>
             </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm border-b-4 border-b-emerald-400">
             <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">บุคลากรที่ลา</div>
             <div className="text-4xl font-bold mt-2 text-gray-800">
               {new Set(records.map(r => r.staffId)).size} <span className="text-lg font-normal text-gray-400">คน</span>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;