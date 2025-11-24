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
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <span className="p-2 bg-teal-100 rounded-lg mr-3 text-teal-700">
          <Users className="w-6 h-6" />
        </span>
        จัดการข้อมูลบุคลากร
      </h2>

      {/* Add New Staff Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-50">
        <h3 className="text-lg font-semibold mb-6 text-teal-800 flex items-center border-b pb-2">
          <UserPlus className="w-5 h-5 mr-2" />
          เพิ่มบุคลากรใหม่
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-5 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-teal-500 focus:border-teal-500"
              placeholder="ระบุชื่อ-นามสกุล"
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
            <select
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-teal-500 focus:border-teal-500"
            >
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg font-medium disabled:opacity-70"
          >
            {submitting ? 'กำลังบันทึก...' : 'เพิ่มข้อมูล'}
          </button>
        </form>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-teal-50">
        <div className="p-4 border-b bg-teal-50/30 flex justify-between items-center">
          <h3 className="font-semibold text-teal-900">รายชื่อบุคลากรทั้งหมด ({filteredList.length})</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="ค้นหาชื่อ..."
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-200 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
            <div className="p-10 text-center text-gray-500 flex justify-center">
                <Loader2 className="animate-spin mr-2" /> กำลังโหลดรายชื่อ...
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-teal-100">
                <thead className="bg-teal-100/70">
                <tr>
                    <th className="px-6 py-4 text-center text-xs font-bold text-teal-800 uppercase tracking-wider">ชื่อ-สกุล</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-teal-800 uppercase tracking-wider">ตำแหน่ง</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-teal-800 uppercase tracking-wider">จัดการ</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                {filteredList.map(staff => (
                    <tr key={staff.id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{staff.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                            {staff.position}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button 
                        onClick={() => handleDelete(staff.id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                        title="ลบข้อมูล"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </td>
                    </tr>
                ))}
                {filteredList.length === 0 && (
                    <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-400 bg-gray-50/50">ไม่พบข้อมูล</td>
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