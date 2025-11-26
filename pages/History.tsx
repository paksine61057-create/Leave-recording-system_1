import React, { useState, useMemo, useEffect } from 'react';
import { User, Role, LeaveRecord, LEAVE_TYPES, POSITIONS, Staff } from '../types';
import { getLeaveRecords, getStaffList, deleteLeaveRecord, updateLeaveRecord } from '../services/dataService';
import { Search, Calendar, Trash2, Edit, X, Save, Plus, Loader2, PieChart, Filter } from 'lucide-react';

interface HistoryProps {
  user: User;
}

const History: React.FC<HistoryProps> = ({ user }) => {
  const isAdmin = user.role === Role.ADMIN;
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [selectedStaffName, setSelectedStaffName] = useState<string>(isAdmin ? 'all' : user.fullName);
  const [selectedMonth, setSelectedMonth] = useState<number>(-1);
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());

  // Edit State
  const [editingRecord, setEditingRecord] = useState<LeaveRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Edit Form State
  const [editFormData, setEditFormData] = useState<Partial<LeaveRecord>>({});
  const [editTempStart, setEditTempStart] = useState('');
  const [editTempEnd, setEditTempEnd] = useState('');

  const refreshData = async () => {
    const [r, s] = await Promise.all([getLeaveRecords(), getStaffList()]);
    setRecords(r);
    setStaffList(s);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('ยืนยันการลบประวัติการลานี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      setProcessing(true);
      await deleteLeaveRecord(id);
      await refreshData();
      setProcessing(false);
    }
  };

  const openEditModal = (record: LeaveRecord) => {
    setEditingRecord(record);
    setEditFormData({
      ...record
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
    setEditFormData({});
    setEditTempStart('');
    setEditTempEnd('');
  };

  const handleEditAddDateRange = () => {
    if (!editTempStart) return;
    const end = editTempEnd || editTempStart;
    
    const newDates = new Set(editFormData.dates || []);
    const startDt = new Date(editTempStart);
    const endDt = new Date(end);
    
    for(let dt = new Date(startDt); dt <= endDt; dt.setDate(dt.getDate() + 1)){
      newDates.add(new Date(dt).toISOString());
    }

    setEditFormData({ ...editFormData, dates: Array.from(newDates).sort() });
    setEditTempStart('');
    setEditTempEnd('');
  };

  const handleEditRemoveDate = (dateToRemove: string) => {
    const newDates = (editFormData.dates || []).filter(d => d !== dateToRemove);
    setEditFormData({ ...editFormData, dates: newDates });
  };

  const handleSaveEdit = async () => {
    if (!editingRecord || !editFormData.dates) return;

    if (editFormData.dates.length === 0) {
      alert("กรุณาระบุวันที่ลาอย่างน้อย 1 วัน");
      return;
    }

    setProcessing(true);

    const updatedRecord: LeaveRecord = {
      ...editingRecord,
      ...editFormData as LeaveRecord,
      totalDays: editFormData.isHalfDay ? 0.5 : editFormData.dates.length
    };

    await updateLeaveRecord(updatedRecord);
    await refreshData();
    setProcessing(false);
    closeEditModal();
  };

  // --- Filtering ---

  const filteredRecords = useMemo(() => {
    let result = records;

    if (selectedStaffName !== 'all') {
      result = result.filter(r => r.staffName.includes(selectedStaffName) || selectedStaffName.includes(r.staffName));
    } else if (!isAdmin) {
       result = result.filter(r => r.staffName === user.fullName);
    }

    result = result.filter(r => {
        if (!r.dates.length) return false;
        const d = new Date(r.dates[0]);
        const yearMatch = d.getFullYear() === yearFilter;
        const monthMatch = selectedMonth === -1 || d.getMonth() === selectedMonth;
        return yearMatch && monthMatch;
    });

    return result.sort((a, b) => new Date(b.dates[0]).getTime() - new Date(a.dates[0]).getTime());
  }, [records, selectedStaffName, selectedMonth, yearFilter, isAdmin, user.fullName]);

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    const s = {
      totalTimes: 0,
      totalDays: 0,
      byType: {} as Record<string, { times: number, days: number }>
    };
    
    // Initialize
    LEAVE_TYPES.forEach(t => s.byType[t] = { times: 0, days: 0 });

    filteredRecords.forEach(r => {
      s.totalTimes += 1;
      s.totalDays += r.totalDays;
      if (s.byType[r.leaveType]) {
        s.byType[r.leaveType].times += 1;
        s.byType[r.leaveType].days += r.totalDays;
      }
    });

    return s;
  }, [filteredRecords]);


  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <span className="p-2.5 bg-white rounded-xl mr-3 text-slate-600 shadow-sm border border-slate-200">
            <Calendar className="w-6 h-6" />
            </span>
            ประวัติการลา
        </h2>
      </div>

      {processing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center border border-slate-200">
                <Loader2 className="animate-spin mr-3 text-school-primary w-6 h-6" /> 
                <span className="text-slate-700 font-medium">กำลังบันทึกข้อมูล...</span>
            </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-2 mb-4 text-slate-500 text-sm font-bold uppercase tracking-wide">
            <Filter className="w-4 h-4" /> <span>ตัวกรองข้อมูล</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {isAdmin && (
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-2">บุคลากร</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                    value={selectedStaffName}
                    onChange={(e) => setSelectedStaffName(e.target.value)}
                    className="w-full border-slate-300 rounded-xl border pl-9 p-2.5 text-sm focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary text-slate-700 bg-slate-50"
                    >
                    <option value="all">ทั้งหมด</option>
                    {staffList.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    </select>
                </div>
            </div>
            )}
            
            <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">เดือน</label>
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full border-slate-300 rounded-xl border p-2.5 text-sm focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary text-slate-700 bg-slate-50"
            >
                <option value={-1}>ทั้งหมด</option>
                {thaiMonths.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            </div>

            <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">ปี (ค.ศ.)</label>
            <input
                type="number"
                value={yearFilter}
                onChange={(e) => setYearFilter(Number(e.target.value))}
                className="w-full border-slate-300 rounded-xl border p-2.5 text-sm focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary text-slate-700 bg-slate-50"
            />
            </div>
        </div>
      </div>

      {/* Summary Statistics Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <h3 className="text-sm font-bold text-slate-500 mb-5 flex items-center uppercase tracking-wider">
            <PieChart className="w-4 h-4 mr-2" /> 
            สรุปข้อมูลการลา ({selectedMonth !== -1 ? thaiMonths[selectedMonth] : 'ทุกเดือน'} {yearFilter})
         </h3>
         
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Grand Total */}
            <div className="bg-slate-800 rounded-xl p-4 text-white shadow-lg shadow-slate-200 col-span-2 md:col-span-1">
               <div className="text-xs text-slate-300 font-medium mb-1">ลาทั้งหมด</div>
               <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">{stats.totalTimes}</span>
                  <span className="text-xs opacity-60">ครั้ง</span>
               </div>
               <div className="flex items-center mt-2 pt-2 border-t border-slate-600">
                  <span className="text-lg font-medium">{stats.totalDays}</span>
                  <span className="text-xs opacity-60 ml-1">วัน</span>
               </div>
            </div>

            {/* Breakdown by Type */}
            <div className="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.byType).map(([type, val]: [string, { times: number, days: number }]) => {
                    if (val.times === 0) return null; // Only show types with data
                    
                    // Elegant Color coding
                    let colorClass = "bg-slate-50 border-slate-200 text-slate-700";
                    if (type === 'การลาป่วย') colorClass = "bg-rose-50 border-rose-100 text-rose-800";
                    else if (type === 'การลากิจส่วนตัว') colorClass = "bg-amber-50 border-amber-100 text-amber-800";
                    else if (type === 'การลาพักผ่อน') colorClass = "bg-emerald-50 border-emerald-100 text-emerald-800";
                    
                    return (
                        <div key={type} className={`rounded-xl p-3 border shadow-sm ${colorClass} flex flex-col justify-between`}>
                        <div className="text-xs font-semibold truncate mb-2 opacity-80" title={type}>{type}</div>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-xl font-bold">{val.times}</span>
                                <span className="text-[10px] ml-1 opacity-70">ครั้ง</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold">{val.days}</span>
                                <span className="text-[10px] ml-1 opacity-70">วัน</span>
                            </div>
                        </div>
                        </div>
                    );
                })}
            </div>
         </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">วันที่ลา</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">ชื่อ-สกุล</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">ประเภท</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">จำนวนวัน</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">หมายเหตุ</th>
                {isAdmin && <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-700">
                     <div className="font-semibold text-center text-slate-800">
                        {new Date(record.dates[0]).toLocaleDateString('th-TH')}
                        {record.dates.length > 1 && ` - ${new Date(record.dates[record.dates.length-1]).toLocaleDateString('th-TH')}`}
                     </div>
                     <div className="flex justify-center mt-1.5">
                        {record.isHalfDay ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            {record.halfDayPeriod === 'morning' ? 'ครึ่งวันเช้า' : 'ครึ่งวันบ่าย'}
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            เต็มวัน
                            </span>
                        )}
                     </div>
                     <div className="text-[10px] text-slate-400 mt-1 text-center font-light">
                        ยื่นเมื่อ: {record.filedDate ? new Date(record.filedDate).toLocaleDateString('th-TH') : '-'}
                     </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 text-center">{record.staffName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">
                    <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs font-medium border border-slate-200">
                        {record.leaveType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 text-center font-bold">{record.totalDays}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate text-center">{record.note || '-'}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => openEditModal(record)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="แก้ไข">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(record.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="ลบ">
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400 bg-slate-50/50 rounded-b-2xl">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-slate-100 rounded-full mb-3">
                         <Search className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium">ไม่พบประวัติการลาตามเงื่อนไขที่เลือก</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
         </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Edit className="w-5 h-5 mr-2 text-school-primary" /> แก้ไขข้อมูลการลา
              </h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อ-สกุล</label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold">{editingRecord.staffName}</div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">วันที่ยื่น/เขียนใบลา</label>
                     <input 
                       type="date"
                       className="w-full border-slate-300 rounded-xl border p-2.5 text-sm focus:ring-school-primary focus:border-school-primary"
                       value={editFormData.filedDate || ''}
                       onChange={(e) => setEditFormData({...editFormData, filedDate: e.target.value})}
                     />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ตำแหน่ง</label>
                    <select 
                      className="w-full border-slate-300 rounded-xl border p-2.5 text-sm focus:ring-school-primary focus:border-school-primary"
                      value={editFormData.position}
                      onChange={(e) => setEditFormData({...editFormData, position: e.target.value})}
                    >
                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ประเภทการลา</label>
                    <select 
                      className="w-full border-slate-300 rounded-xl border p-2.5 text-sm focus:ring-school-primary focus:border-school-primary"
                      value={editFormData.leaveType}
                      onChange={(e) => setEditFormData({...editFormData, leaveType: e.target.value})}
                    >
                      {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Dates Edit Section */}
                  <div className="md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-3">แก้ไขวันลา</label>
                    
                    <div className="flex gap-3 items-end mb-4">
                        <div className="flex-1">
                          <label className="text-xs text-slate-500 mb-1 block font-medium">เริ่ม</label>
                          <input 
                            type="date" 
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                            value={editTempStart}
                            onChange={(e) => setEditTempStart(e.target.value)} 
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-slate-500 mb-1 block font-medium">สิ้นสุด</label>
                          <input 
                            type="date" 
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                            value={editTempEnd}
                            min={editTempStart}
                            onChange={(e) => setEditTempEnd(e.target.value)} 
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={handleEditAddDateRange}
                          className="px-4 py-2.5 bg-school-primary text-white rounded-lg text-sm hover:bg-blue-800 shadow-sm transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="max-h-32 overflow-y-auto border border-slate-200 bg-white rounded-xl p-2 grid grid-cols-2 gap-2 custom-scrollbar">
                       {editFormData.dates?.map(date => (
                         <div key={date} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg text-sm text-slate-700 border border-slate-100">
                            <span>{new Date(date).toLocaleDateString('th-TH')}</span>
                            <button onClick={() => handleEditRemoveDate(date)} className="text-slate-400 hover:text-red-500 p-1">
                              <X className="w-4 h-4" />
                            </button>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                     <div className="flex items-center space-x-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editFormData.isHalfDay}
                            onChange={(e) => setEditFormData({...editFormData, isHalfDay: e.target.checked})}
                            className="h-5 w-5 text-school-primary border-slate-300 rounded focus:ring-school-primary"
                          />
                          <span className="ml-3 text-sm font-medium text-slate-700">ลาครึ่งวัน</span>
                        </label>
                        {editFormData.isHalfDay && (
                            <div className="flex space-x-4 text-sm ml-6 pl-6 border-l border-slate-300">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="editPeriod" className="text-school-primary focus:ring-school-primary" value="morning" checked={editFormData.halfDayPeriod === 'morning'} onChange={() => setEditFormData({...editFormData, halfDayPeriod: 'morning'})} />
                                    <span className="ml-2 text-slate-600">เช้า</span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="editPeriod" className="text-school-primary focus:ring-school-primary" value="afternoon" checked={editFormData.halfDayPeriod === 'afternoon'} onChange={() => setEditFormData({...editFormData, halfDayPeriod: 'afternoon'})} />
                                    <span className="ml-2 text-slate-600">บ่าย</span>
                                </label>
                            </div>
                        )}
                     </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">หมายเหตุ</label>
                    <textarea 
                      className="w-full border-slate-300 rounded-xl border p-2.5 text-sm focus:ring-school-primary focus:border-school-primary"
                      rows={2}
                      value={editFormData.note || ''}
                      onChange={(e) => setEditFormData({...editFormData, note: e.target.value})}
                    ></textarea>
                  </div>
               </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
               <button onClick={closeEditModal} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition-all text-sm font-medium">
                 ยกเลิก
               </button>
               <button onClick={handleSaveEdit} className="px-5 py-2.5 bg-school-primary text-white rounded-lg hover:bg-blue-800 shadow-sm hover:shadow transition-all flex items-center text-sm font-medium">
                 <Save className="w-4 h-4 mr-2" /> บันทึกการแก้ไข
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;