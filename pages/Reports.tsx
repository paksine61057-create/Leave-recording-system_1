import React, { useState, useEffect, useMemo } from 'react';
import { getLeaveRecords } from '../services/dataService';
import { Printer, FileDown, Loader2, Table, List } from 'lucide-react';
import { LeaveRecord } from '../types';

const Reports: React.FC = () => {
  const [filterType, setFilterType] = useState<'month' | 'year'>('year'); // Default to year for summaries
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list'); // 'list' = Detailed, 'matrix' = Summary
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetch = async () => {
        const data = await getLeaveRecords();
        setRecords(data);
        setLoading(false);
    };
    fetch();
  }, []);

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  // 1. Filter Records based on time selection
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (!record.dates.length) return false;
      const date = new Date(record.dates[0]);
      const yearMatch = date.getFullYear() === selectedYear;
      
      if (filterType === 'year') return yearMatch;
      return yearMatch && date.getMonth() === selectedMonth;
    });
  }, [records, filterType, selectedMonth, selectedYear]);

  // 2. Aggregate Data for Matrix View
  const summaryData = useMemo(() => {
    if (viewMode !== 'matrix') return [];
    
    const summary: Record<string, {
      name: string;
      position: string;
      sick: number;
      personal: number;
      vacation: number;
      birth: number;
      other: number;
      total: number;
    }> = {};

    filteredRecords.forEach(r => {
      if (!summary[r.staffName]) {
        summary[r.staffName] = {
          name: r.staffName,
          position: r.position,
          sick: 0,
          personal: 0,
          vacation: 0,
          birth: 0,
          other: 0,
          total: 0
        };
      }

      const days = r.totalDays;
      summary[r.staffName].total += days;

      // Categorize Leave Types
      if (r.leaveType === 'การลาป่วย') {
        summary[r.staffName].sick += days;
      } else if (r.leaveType === 'การลากิจส่วนตัว') {
        summary[r.staffName].personal += days;
      } else if (r.leaveType === 'การลาพักผ่อน') {
        summary[r.staffName].vacation += days;
      } else if (r.leaveType.includes('คลอด') || r.leaveType.includes('ภริยา')) {
        summary[r.staffName].birth += days;
      } else {
        summary[r.staffName].other += days;
      }
    });

    // Convert to array and sort by name
    return Object.values(summary).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredRecords, viewMode]);

  const handlePrint = () => {
    alert(
      "คำแนะนำในการบันทึกเป็น PDF:\n\n" +
      "1. หน้าต่างพิมพ์จะเปิดขึ้น\n" +
      "2. ที่ช่อง 'Destination' (ปลายทาง) ให้เลือก 'Save as PDF' (บันทึกเป็น PDF)\n" +
      "3. กดปุ่ม 'Save' (บันทึก)\n\n" + 
      "แนะนำ: เลือกการตั้งค่า 'Background graphics' (กราฟิกพื้นหลัง) เพื่อความสวยงาม"
    );
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const currentThaiDate = new Date().toLocaleDateString('th-TH', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="p-2 bg-blue-100 rounded-lg mr-3 text-blue-700">
                <Printer className="w-6 h-6" />
            </span>
            รายงานสรุปการลา
        </h2>
        <button 
          onClick={handlePrint} 
          className="flex items-center px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-lg shadow-gray-300"
        >
          <FileDown className="w-4 h-4 mr-2" />
          พิมพ์ / บันทึกเป็น PDF
        </button>
      </div>

      {/* Controls */}
      <div className="print:hidden bg-blue-50/50 p-6 rounded-xl shadow-sm border border-blue-100 flex flex-wrap gap-6 items-end">
        
        {/* View Mode Selector */}
        <div>
           <label className="block text-sm font-semibold text-gray-600 mb-2">รูปแบบการแสดงผล</label>
           <div className="flex bg-white rounded-lg border border-gray-300 p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4 mr-2" /> รายการละเอียด
              </button>
              <button 
                onClick={() => setViewMode('matrix')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'matrix' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Table className="w-4 h-4 mr-2" /> สรุปรายบุคคล
              </button>
           </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">ช่วงเวลา</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border-gray-300 rounded-lg border p-2.5 text-sm w-32 focus:ring-blue-500"
          >
            <option value="month">รายเดือน</option>
            <option value="year">รายปี</option>
          </select>
        </div>

        {filterType === 'month' && (
           <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">เดือน</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border-gray-300 rounded-lg border p-2.5 text-sm w-40 focus:ring-blue-500"
            >
              {thaiMonths.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">ปี (ค.ศ.)</label>
          <input 
            type="number" 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border-gray-300 rounded-lg border p-2.5 text-sm w-28 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Printable Area */}
      <div id="printable-area" className="bg-white p-8 shadow-sm rounded-xl print:shadow-none print:p-0 print:w-full">
        
        <div className="text-center mb-8">
          <img src="https://img5.pic.in.th/file/secure-sv1/5bc66fd0-c76e-41c4-87ed-46d11f4a36fa.png" alt="Logo" className="h-24 w-24 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">
             {viewMode === 'list' ? 'รายงานรายละเอียดการลา' : 'แบบสรุปวันลาพักผ่อนประจำปีของข้าราชการครูและบุคลากรทางการศึกษา'}
          </h1>
          <h2 className="text-xl font-medium text-gray-700">โรงเรียนประจักษ์ศิลปาคม</h2>
          <p className="text-gray-600 mt-2 font-medium">
            ประจำ{filterType === 'month' ? `เดือน ${thaiMonths[selectedMonth]}` : ''} ปี {selectedYear + 543}
          </p>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          
          {/* MODE: DETAILED LIST */}
          {viewMode === 'list' && (
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
              <thead className="bg-blue-100 print:bg-blue-100">
                <tr>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100">ลำดับ</th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100">ชื่อ-สกุล</th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100">ตำแหน่ง</th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100">ประเภทการลา</th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100">วันที่ลา</th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100">วันรวม</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.length > 0 ? filteredRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors print:hover:bg-transparent">
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 border border-gray-300 text-center">{index + 1}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">{record.staffName}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 border border-gray-300 text-center">{record.position}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 border border-gray-300 text-center">{record.leaveType}</td>
                    <td className="px-2 py-2 text-sm text-gray-500 border border-gray-300 text-center">
                      {record.dates.map(d => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })).join(', ')}
                      {record.isHalfDay && (
                        <span className="text-xs text-blue-600 ml-1 font-semibold print:text-black">
                          ({record.halfDayPeriod === 'morning' ? 'เช้า' : 'บ่าย'})
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 text-center border border-gray-300 font-bold">{record.totalDays}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 italic">ไม่พบข้อมูลการลาในช่วงเวลานี้</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* MODE: INDIVIDUAL SUMMARY (MATRIX) */}
          {viewMode === 'matrix' && (
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
              <thead className="bg-blue-100 print:bg-blue-100">
                <tr>
                  <th rowSpan={2} className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100 w-10">ที่</th>
                  <th rowSpan={2} className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100 w-48">ชื่อ-สกุล</th>
                  <th rowSpan={2} className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100">ตำแหน่ง</th>
                  <th colSpan={5} className="px-2 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-50 print:bg-blue-50">ประเภทการลา (วัน)</th>
                  <th rowSpan={2} className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100 w-16">รวมทั้งสิ้น</th>
                </tr>
                <tr>
                  <th className="px-1 py-2 text-center text-xs font-semibold text-gray-600 border border-gray-300 bg-white">ป่วย</th>
                  <th className="px-1 py-2 text-center text-xs font-semibold text-gray-600 border border-gray-300 bg-white">กิจ</th>
                  <th className="px-1 py-2 text-center text-xs font-semibold text-gray-600 border border-gray-300 bg-white">พักผ่อน</th>
                  <th className="px-1 py-2 text-center text-xs font-semibold text-gray-600 border border-gray-300 bg-white">คลอด</th>
                  <th className="px-1 py-2 text-center text-xs font-semibold text-gray-600 border border-gray-300 bg-white">อื่นๆ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summaryData.length > 0 ? summaryData.map((person, index) => (
                  <tr key={person.name} className="hover:bg-gray-50 transition-colors print:hover:bg-transparent">
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 border border-gray-300 text-center">{index + 1}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300 text-left">{person.name}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 border border-gray-300 text-center">{person.position}</td>
                    
                    <td className="px-2 py-2 text-center text-sm text-gray-600 border border-gray-300">{person.sick > 0 ? person.sick : '-'}</td>
                    <td className="px-2 py-2 text-center text-sm text-gray-600 border border-gray-300">{person.personal > 0 ? person.personal : '-'}</td>
                    <td className="px-2 py-2 text-center text-sm text-gray-600 border border-gray-300">{person.vacation > 0 ? person.vacation : '-'}</td>
                    <td className="px-2 py-2 text-center text-sm text-gray-600 border border-gray-300">{person.birth > 0 ? person.birth : '-'}</td>
                    <td className="px-2 py-2 text-center text-sm text-gray-600 border border-gray-300">{person.other > 0 ? person.other : '-'}</td>
                    
                    <td className="px-2 py-2 text-center text-sm font-bold text-blue-700 border border-gray-300 bg-blue-50/50">{person.total}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500 italic">ไม่พบข้อมูลการลาในช่วงเวลานี้</td>
                  </tr>
                )}
              </tbody>
              {summaryData.length > 0 && (
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={3} className="px-2 py-2 text-right border border-gray-300">รวมทั้งหมด</td>
                    <td className="px-2 py-2 text-center border border-gray-300">{summaryData.reduce((a, b) => a + b.sick, 0)}</td>
                    <td className="px-2 py-2 text-center border border-gray-300">{summaryData.reduce((a, b) => a + b.personal, 0)}</td>
                    <td className="px-2 py-2 text-center border border-gray-300">{summaryData.reduce((a, b) => a + b.vacation, 0)}</td>
                    <td className="px-2 py-2 text-center border border-gray-300">{summaryData.reduce((a, b) => a + b.birth, 0)}</td>
                    <td className="px-2 py-2 text-center border border-gray-300">{summaryData.reduce((a, b) => a + b.other, 0)}</td>
                    <td className="px-2 py-2 text-center border border-gray-300 text-blue-800">{summaryData.reduce((a, b) => a + b.total, 0)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}

        </div>

        <div className="mt-16 flex justify-between px-4 page-break-inside-avoid break-inside-avoid">
          <div className="text-center w-5/12">
            <p className="mb-8 text-gray-800 font-medium">ขอรับรองว่าข้อมูลถูกต้อง</p>
            <div className="my-6 border-b border-dotted border-gray-400 w-3/4 mx-auto"></div>
            <p className="mb-1 text-gray-800">(.......................................................)</p>
            <p className="mb-1 font-semibold text-gray-800">หัวหน้ากลุ่มบริหารงานบุคคล</p>
            <p className="text-gray-600 mt-2">วันที่ ......../......../............</p>
          </div>
          <div className="text-center w-5/12">
            <p className="mb-8 text-gray-800 font-medium">ทราบ</p>
            <div className="my-6 border-b border-dotted border-gray-400 w-3/4 mx-auto"></div>
            <p className="mb-1 text-gray-800">(.......................................................)</p>
            <p className="mb-1 font-semibold text-gray-800">ผู้อำนวยการโรงเรียนประจักษ์ศิลปาคม</p>
            <p className="text-gray-600 mt-2">วันที่ ......../......../............</p>
          </div>
        </div>
        
        <div className="mt-8 text-right text-xs text-gray-400 print:text-gray-500">
            พิมพ์เมื่อ: {currentThaiDate}
        </div>

      </div>
    </div>
  );
};

export default Reports;