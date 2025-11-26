import React, { useState, useEffect } from 'react';
import { Staff, POSITIONS } from '../types';
import { getStaffList, addStaff, removeStaff } from '../services/dataService';
import { Trash2, UserPlus, Search, Users, Loader2 } from 'lucide-react';

const Personnel: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState(POSITIONS[4]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refreshList = async () => {
    setLoading(true);
    const list = await getStaffList();
    setStaffList(list);
    setLoading(false);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      setSubmitting(true);
      await addStaff(newName, newPosition);
      setNewName('');
      await refreshList();
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('ยืนยันการลบข้อมูลบุคลากร?')) {
      setSubmitting(true);
      await removeStaff(id);
      await refreshList();
      setSubmitting(false);
    }
  };

  const filteredList = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center">
        <span className="p-2.5 bg-white rounded-xl mr-3 text-slate-600 shadow-sm border border-slate-200">
          <Users className="w-6 h-6" />
        </span>
        จัดการข้อมูลบุคลากร
      </h2>

      {/* Add New Staff Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-6 text-slate-700 flex items-center border-b border-slate-100 pb-3">
          <UserPlus className="w-5 h-5 mr-2 text-school-primary" />
          เพิ่มบุคลากรใหม่
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-5 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1.5">ชื่อ-นามสกุล</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border-slate-300 rounded-xl shadow-sm p-2.5 border focus:ring-school-primary focus:border-school-primary bg-slate-50"
              placeholder="ระบุชื่อ-นามสกุล"
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1.5">ตำแหน่ง</label>
            <select
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              className="w-full border-slate-300 rounded-xl shadow-sm p-2.5 border focus:ring-school-primary focus:border-school-primary bg-slate-50"
            >
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-2.5 bg-school-primary text-white rounded-xl hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg font-medium disabled:opacity-70"
          >
            {submitting ? 'กำลังบันทึก...' : 'เพิ่มข้อมูล'}
          </button>
        </form>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">รายชื่อบุคลากรทั้งหมด ({filteredList.length})</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="ค้นหาชื่อ..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-school-primary/20 bg-white w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
            <div className="p-10 text-center text-slate-400 flex justify-center">
                <Loader2 className="animate-spin mr-2" /> กำลังโหลดรายชื่อ...
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">ชื่อ-สกุล</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">ตำแหน่ง</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">จัดการ</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                {filteredList.map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 text-center">{staff.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs border border-slate-200">
                            {staff.position}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button 
                        onClick={() => handleDelete(staff.id)}
                        className="text-slate-400 hover:text-red-500 bg-white border border-slate-200 p-2 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                        title="ลบข้อมูล"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </td>
                    </tr>
                ))}
                {filteredList.length === 0 && (
                    <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-400 bg-slate-50/30">ไม่พบข้อมูล</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default Personnel;