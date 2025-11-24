import React, { useState, useEffect } from 'react';
import { getAccessLogs, clearAccessLogs } from '../services/dataService';
import { AccessLog, Role } from '../types';
import { Shield, Trash2, Clock, UserCheck, Loader2 } from 'lucide-react';

const AccessLogs: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
        const data = await getAccessLogs();
        setLogs(data);
        setLoading(false);
    };
    fetch();
  }, []);

  const handleClearLogs = () => {
    if (window.confirm('คุณต้องการล้างประวัติการเข้าใช้งานทั้งหมดหรือไม่? (หมายเหตุ: ในเวอร์ชั่นออนไลน์อาจไม่สามารถลบได้โดยตรง)')) {
      clearAccessLogs();
      setLogs([]);
    }
  };

  if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="animate-spin w-8 h-8 text-purple-500" />
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="p-2 bg-purple-100 rounded-lg mr-3 text-purple-700">
            <Shield className="w-6 h-6" />
          </span>
          ประวัติการเข้าใช้งานระบบ
        </h2>
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
            disabled
            title="จัดการได้ผ่าน Google Sheets"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            ล้างประวัติ (จัดการที่ Google Sheets)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-50 flex items-center">
           <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
             <Clock className="w-6 h-6" />
           </div>
           <div>
             <p className="text-sm text-gray-500">ใช้งานล่าสุด</p>
             <p className="text-lg font-bold text-gray-800">
               {logs.length > 0 ? new Date(logs[0].timestamp).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'}) : '-'}
             </p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-50 flex items-center">
           <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
             <UserCheck className="w-6 h-6" />
           </div>
           <div>
             <p className="text-sm text-gray-500">จำนวนครั้งที่เข้าใช้งาน</p>
             <p className="text-lg font-bold text-gray-800">{logs.length} ครั้ง</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-purple-50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-100">
            <thead className="bg-purple-100/70">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-bold text-purple-800 uppercase tracking-wider">วัน-เวลา</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-purple-800 uppercase tracking-wider">ชื่อ-สกุล</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-purple-800 uppercase tracking-wider">ชื่อผู้ใช้</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-purple-800 uppercase tracking-wider">สิทธิ์การใช้งาน</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-purple-50/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                    {new Date(log.timestamp).toLocaleDateString('th-TH', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })} น.
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 text-center">
                    {log.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {log.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      log.role === Role.ADMIN 
                        ? 'bg-pink-100 text-pink-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {log.role === Role.ADMIN ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป'}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400 bg-gray-50/50">
                    ยังไม่มีประวัติการเข้าใช้งาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessLogs;