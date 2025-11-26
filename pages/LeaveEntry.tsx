import React, { useState, useEffect } from 'react';
import { getStaffList, addLeaveRecord } from '../services/dataService';
import { Staff, LEAVE_TYPES, POSITIONS, LeaveRecord } from '../types';
import { Save, User, MoveRight, CheckCircle, XCircle, Plus, Trash2, FilePlus, Loader2 } from 'lucide-react';

const LeaveEntry: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Date Management
  const [dateRanges, setDateRanges] = useState<{start: string, end: string}[]>([]);
  const [tempStart, setTempStart] = useState('');
  const [tempEnd, setTempEnd] = useState('');

  const [formData, setFormData] = useState({
    position: '',
    leaveType: LEAVE_TYPES[0],
    isHalfDay: false,
    halfDayPeriod: 'morning' as 'morning' | 'afternoon',
    note: '',
    filedDate: new Date().toISOString().split('T')[0]
  });
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoadingStaff(true);
      const list = await getStaffList();
      setStaffList(list);
      setLoadingStaff(false);
    };
    fetchStaff();
  }, []);

  // Set default position when staff is selected
  useEffect(() => {
    if (selectedStaff) {
      setFormData(prev => ({ ...prev, position: selectedStaff.position || POSITIONS[4] }));
    }
  }, [selectedStaff]);

  const handleDragStart = (e: React.DragEvent, staff: Staff) => {
    e.dataTransfer.setData("staffId", staff.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const staffId = e.dataTransfer.getData("staffId");
    const staff = staffList.find(s => s.id === staffId);
    if (staff) setSelectedStaff(staff);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const addDateRange = () => {
    if (!tempStart) return;
    const end = tempEnd || tempStart;
    
    if (new Date(end) < new Date(tempStart)) {
      setNotification({ msg: 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setDateRanges([...dateRanges, { start: tempStart, end }]);
    setTempStart('');
    setTempEnd('');
  };

  const removeDateRange = (index: number) => {
    const newRanges = [...dateRanges];
    newRanges.splice(index, 1);
    setDateRanges(newRanges);
  };

  const getAllDates = () => {
    const allDates: Set<string> = new Set();
    
    const processRange = (s: string, e: string) => {
      const start = new Date(s);
      const end = new Date(e);
      for(let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)){
        allDates.add(new Date(dt).toISOString());
      }
    };

    dateRanges.forEach(r => processRange(r.start, r.end));

    if (dateRanges.length === 0 && tempStart) {
      processRange(tempStart, tempEnd || tempStart);
    }

    return Array.from(allDates).sort();
  };

  const calculateTotalDays = () => {
    if (formData.isHalfDay) return 0.5;
    return getAllDates().length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) {
      setNotification({ msg: 'กรุณาเลือกบุคลากร', type: 'error' });
      return;
    }

    const finalDates = getAllDates();
    if (finalDates.length === 0) {
      setNotification({ msg: 'กรุณาระบุวันที่ลา', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    const record: Omit<LeaveRecord, 'id' | 'createdAt'> = {
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      position: formData.position,
      leaveType: formData.leaveType,
      dates: finalDates,
      filedDate: formData.filedDate,
      totalDays: calculateTotalDays(),
      isHalfDay: formData.isHalfDay,
      halfDayPeriod: formData.isHalfDay ? formData.halfDayPeriod : undefined,
      note: formData.note
    };

    await addLeaveRecord(record);
    
    setIsSubmitting(false);
    setNotification({ msg: 'บันทึกข้อมูลสำเร็จ', type: 'success' });
    
    // Reset
    setDateRanges([]);
    setTempStart('');
    setTempEnd('');
    setFormData(prev => ({
      ...prev,
      isHalfDay: false,
      note: '',
      filedDate: new Date().toISOString().split('T')[0]
    }));

    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center">
        <span className="p-2.5 bg-white rounded-xl mr-3 text-slate-600 shadow-sm border border-slate-200">
           <FilePlus className="w-6 h-6" />
        </span>
        บันทึกการลา
      </h2>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center shadow-sm ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {notification.type === 'success' ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
          {notification.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Staff List */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 h-[650px] flex flex-col">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <User className="w-4 h-4 mr-2" /> รายชื่อบุคลากร
          </h3>
          
          {loadingStaff ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mr-2" /> กำลังโหลด...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {staffList.map(staff => (
                <div
                    key={staff.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, staff)}
                    onClick={() => setSelectedStaff(staff)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center group
                    ${selectedStaff?.id === staff.id ? 'bg-school-primary text-white border-school-primary shadow-md' : 'bg-slate-50 hover:bg-white border-transparent hover:border-slate-200 hover:shadow-sm text-slate-600'}
                    `}
                >
                    <span className="font-medium">{staff.name}</span>
                    <MoveRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 ${selectedStaff?.id === staff.id ? 'text-white' : 'text-slate-400'}`} />
                </div>
                ))}
                {staffList.length === 0 && <p className="text-center text-slate-400 mt-4">ไม่พบรายชื่อ</p>}
            </div>
          )}
        </div>

        {/* Right: Drop Zone & Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Drop Zone */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center h-40 shadow-sm
              ${selectedStaff ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-school-primary hover:bg-slate-50'}
            `}
          >
            {selectedStaff ? (
              <div className="text-center animate-fade-in">
                <p className="text-sm text-emerald-600 mb-1 font-medium">บุคลากรที่เลือก</p>
                <h3 className="text-2xl font-bold text-slate-800">{selectedStaff.name}</h3>
                <span className="inline-block mt-1 px-3 py-1 bg-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
                    {selectedStaff.position}
                </span>
              </div>
            ) : (
              <div className="text-center text-slate-300 pointer-events-none">
                <div className="bg-slate-50 p-3 rounded-full inline-block mb-3">
                    <User className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">ลากชื่อมาวางที่นี่</p>
                <p className="text-sm">หรือ คลิกชื่อจากรายการด้านซ้าย</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4">
                 <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">ตำแหน่ง</label>
                    <select 
                      className="w-full border-slate-300 rounded-xl shadow-sm p-2.5 border focus:ring-school-primary focus:border-school-primary bg-slate-50"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      required
                    >
                      <option value="">เลือกตำแหน่ง...</option>
                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 <div className="md:w-1/3">
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">วันที่ยื่น/เขียนใบลา</label>
                    <input 
                      type="date"
                      className="w-full border-slate-300 rounded-xl shadow-sm p-2.5 border focus:ring-school-primary focus:border-school-primary bg-slate-50"
                      value={formData.filedDate}
                      onChange={(e) => setFormData({...formData, filedDate: e.target.value})}
                      required
                    />
                 </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">ประเภทการลา</label>
                <select 
                  className="w-full border-slate-300 rounded-xl shadow-sm p-2.5 border focus:ring-school-primary focus:border-school-primary bg-slate-50"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                >
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Date Selection */}
              <div className="col-span-1 md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-3">ระบุวันลา (สามารถเพิ่มได้หลายช่วง)</label>
                
                <div className="flex flex-col md:flex-row gap-3 items-end mb-3">
                  <div className="flex-1 w-full">
                    <label className="block text-xs text-slate-500 mb-1 font-medium">วันที่เริ่ม</label>
                    <input 
                      type="date"
                      className="w-full border-slate-300 rounded-xl shadow-sm p-2.5 border focus:ring-school-primary focus:border-school-primary"
                      value={tempStart}
                      min="2025-01-01"
                      onChange={(e) => setTempStart(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs text-slate-500 mb-1 font-medium">ถึงวันที่ (ถ้าวันเดียวไม่ต้องระบุ)</label>
                    <input 
                      type="date"
                      className="w-full border-slate-300 rounded-xl shadow-sm p-2.5 border focus:ring-school-primary focus:border-school-primary"
                      value={tempEnd}
                      min={tempStart}
                      onChange={(e) => setTempEnd(e.target.value)}
                      disabled={!tempStart || formData.isHalfDay}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addDateRange}
                    disabled={!tempStart}
                    className="flex items-center px-4 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    <Plus className="w-5 h-5 mr-1" /> เพิ่ม
                  </button>
                </div>

                {dateRanges.length > 0 && (
                  <div className="space-y-2 mt-3 p-2 bg-white rounded-xl border border-slate-200 max-h-40 overflow-y-auto custom-scrollbar">
                    {dateRanges.map((range, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 px-3 rounded-lg border border-slate-100 shadow-sm text-sm">
                        <span className="text-slate-700 font-medium">
                           {new Date(range.start).toLocaleDateString('th-TH')} 
                           {range.end && range.end !== range.start && ` - ${new Date(range.end).toLocaleDateString('th-TH')}`}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => removeDateRange(idx)}
                          className="text-red-400 hover:text-red-600 bg-white p-1 rounded-md shadow-sm border border-slate-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {dateRanges.length === 0 && tempStart && (
                  <div className="mt-2 text-xs text-blue-500 italic">
                    * ระบบจะใช้วันที่ที่ระบุในช่องด้านบน หากไม่ได้กดปุ่ม "เพิ่ม"
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-2">
                 <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="inline-flex items-center cursor-pointer">
                        <input 
                        type="checkbox" 
                        id="halfDay"
                        checked={formData.isHalfDay}
                        onChange={(e) => setFormData({...formData, isHalfDay: e.target.checked})}
                        className="h-5 w-5 text-school-primary focus:ring-school-primary border-slate-300 rounded"
                        />
                        <span className="ml-3 text-sm font-semibold text-slate-700">ลาครึ่งวัน</span>
                    </label>

                    {formData.isHalfDay && (
                      <div className="flex space-x-4 ml-6 pl-6 border-l border-slate-300">
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="radio" 
                            name="period" 
                            value="morning"
                            checked={formData.halfDayPeriod === 'morning'}
                            onChange={() => setFormData({...formData, halfDayPeriod: 'morning'})}
                            className="text-school-primary focus:ring-school-primary"
                          />
                          <span className="ml-2 text-sm text-slate-600">ช่วงเช้า</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="radio" 
                            name="period" 
                            value="afternoon"
                            checked={formData.halfDayPeriod === 'afternoon'}
                            onChange={() => setFormData({...formData, halfDayPeriod: 'afternoon'})}
                            className="text-school-primary focus:ring-school-primary"
                          />
                          <span className="ml-2 text-sm text-slate-600">ช่วงบ่าย</span>
                        </label>
                      </div>
                    )}
                 </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">จำนวนวันรวม</label>
                <div className="text-3xl font-bold text-school-primary bg-slate-50 inline-block px-5 py-2 rounded-xl border border-slate-200">
                  {calculateTotalDays()} <span className="text-base font-normal text-slate-500">วัน</span>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">หมายเหตุ</label>
                <textarea 
                  className="w-full border-slate-300 rounded-xl shadow-sm p-2.5 border focus:ring-school-primary focus:border-school-primary bg-slate-50"
                  rows={3}
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                ></textarea>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                type="submit" 
                className="flex items-center px-8 py-3 bg-school-primary text-white rounded-xl hover:bg-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                disabled={!selectedStaff || (dateRanges.length === 0 && !tempStart) || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaveEntry;