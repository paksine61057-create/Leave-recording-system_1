import React, { useState, useEffect, useMemo } from 'react';
import { getLeaveRecords, getStaffList } from '../services/dataService';
import { Printer, FileDown, Loader2, Table, List } from 'lucide-react';
import { LeaveRecord, Staff } from '../types';

const Reports: React.FC = () => {
  const [filterType, setFilterType] = useState<'month' | 'year' | 'fiscal_half'>('year');
  const [fiscalHalf, setFiscalHalf] = useState<1 | 2>(1); // 1 = Oct-Mar, 2 = Apr-Sep
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list'); // 'list' = Detailed, 'matrix' = Summary
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetch = async () => {
        const [leavesData, staffData] = await Promise.all([
          getLeaveRecords(),
          getStaffList()
        ]);
        setRecords(leavesData);
        setStaffList(staffData);
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
      const m = date.getMonth(); // 0-11
      const y = date.getFullYear();
      
      if (filterType === 'year') {
        // Simple calendar year match
        return y === selectedYear;
      } 
      
      if (filterType === 'month') {
        // Month and Year match
        return y === selectedYear && m === selectedMonth;
      }

      if (filterType === 'fiscal_half') {
        // Fiscal Year Calculation
        // E.g. Selected Year 2025 (2568)
        // Round 1: Oct 2024 - Mar 2025
        // Round 2: Apr 2025 - Sep 2025
        
        if (fiscalHalf === 1) {
            // Check Oct-Dec of Previous Year OR Jan-Mar of Current Year
            const isPrevYearPart = (y === selectedYear - 1) && (m >= 9); // Oct(9), Nov(10), Dec(11)
            const isCurrYearPart = (y === selectedYear) && (m <= 2); // Jan(0), Feb(1), Mar(2)
            return isPrevYearPart || isCurrYearPart;
        } else {
            // Check Apr-Sep of Current Year
            return (y === selectedYear) && (m >= 3 && m <= 8); // Apr(3) to Sep(8)
        }
      }

      return false;
    });
  }, [records, filterType, selectedMonth, selectedYear, fiscalHalf]);

  // 2. Aggregate Data for Matrix View
  const summaryData = useMemo(() => {
    if (viewMode !== 'matrix') return [];
    
    // Initialize map with ALL staff to ensure order and completeness
    const statsMap = new Map<string, {
      name: string;
      position: string;
      sick: number;
      personal: number;
      vacation: number;
      birth: number;
      other: number;
      total: number;
      totalTimes: number;
      sickTimes: number;
      personalTimes: number;
      vacationTimes: number;
      birthTimes: number;
      otherTimes: number;
    }>();

    // Fill with empty stats for all staff
    staffList.forEach(staff => {
      statsMap.set(staff.name, {
        name: staff.name,
        position: staff.position,
        sick: 0,
        personal: 0,
        vacation: 0,
        birth: 0,
        other: 0,
        total: 0,
        totalTimes: 0,
        sickTimes: 0,
        personalTimes: 0,
        vacationTimes: 0,
        birthTimes: 0,
        otherTimes: 0
      });
    });

    // Aggregate data from records
    filteredRecords.forEach(r => {
      let entry = statsMap.get(r.staffName);
      
      // If staff not in current DB list (e.g. deleted/historical), create entry
      if (!entry) {
        entry = {
          name: r.staffName,
          position: r.position,
          sick: 0,
          personal: 0,
          vacation: 0,
          birth: 0,
          other: 0,
          total: 0,
          totalTimes: 0,
          sickTimes: 0,
          personalTimes: 0,
          vacationTimes: 0,
          birthTimes: 0,
          otherTimes: 0
        };
        statsMap.set(r.staffName, entry);
      }

      const days = r.totalDays;
      entry.total += days;
      entry.totalTimes += 1;

      if (r.leaveType === 'การลาป่วย') {
        entry.sick += days;
        entry.sickTimes += 1;
      } else if (r.leaveType === 'การลากิจส่วนตัว') {
        entry.personal += days;
        entry.personalTimes += 1;
      } else if (r.leaveType === 'การลาพักผ่อน') {
        entry.vacation += days;
        entry.vacationTimes += 1;
      } else if (r.leaveType.includes('คลอด') || r.leaveType.includes('ภริยา')) {
        entry.birth += days;
        entry.birthTimes += 1;
      } else {
        entry.other += days;
        entry.otherTimes += 1;
      }
    });

    // Generate result array preserving Staff List order
    const orderedResult = staffList.map(staff => statsMap.get(staff.name)).filter(x => x !== undefined);
    
    // Append any orphaned records (staff not in DB but have records)
    const processedNames = new Set(orderedResult.map(x => x!.name));
    const remainingResult = Array.from(statsMap.values()).filter(item => !processedNames.has(item.name));

    return [...orderedResult, ...remainingResult] as typeof orderedResult;
  }, [filteredRecords, viewMode, staffList]);

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

  const getReportSubtitle = () => {
      const thaiYear = selectedYear + 543;
      if (filterType === 'month') {
          return `ประจำเดือน ${thaiMonths[selectedMonth]} ปี ${thaiYear}`;
      } else if (filterType === 'fiscal_half') {
          if (fiscalHalf === 1) {
              return `รอบการประเมิน ครั้งที่ 1 (1 ตุลาคม ${thaiYear - 1} - 31 มีนาคม ${thaiYear})`;
          } else {
              return `รอบการประเมิน ครั้งที่ 2 (1 เมษายน ${thaiYear} - 30 กันยายน ${thaiYear})`;
          }
      } else {
          return `ประจำปี ${thaiYear}`;
      }
  };

  if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="animate-spin w-8 h-8 text-slate-500" />
        </div>
      );
  }

  // Helper to render cell value with days only
  const renderCell = (days: number) => {
    if (days === 0) return '-';
    return (
      <span className="font-semibold text-gray-800">{days}</span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <span className="p-2.5 bg-white rounded-xl mr-3 text-slate-600 shadow-sm border border-slate-200">
                <Printer className="w-6 h-6" />
            </span>
            รายงานสรุปการลา
        </h2>
        <button 
          onClick={handlePrint} 
          className="flex items-center px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-slate-300"
        >
          <FileDown className="w-4 h-4 mr-2" />
          พิมพ์ / บันทึกเป็น PDF
        </button>
      </div>

      {/* Controls */}
      <div className="print:hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-6 items-end">
        
        {/* View Mode Selector */}
        <div>
           <label className="block text-sm font-semibold text-slate-600 mb-2">รูปแบบการแสดงผล</label>
           <div className="flex bg-slate-50 rounded-lg border border-slate-200 p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-school-primary shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <List className="w-4 h-4 mr-2" /> รายการละเอียด
              </button>
              <button 
                onClick={() => setViewMode('matrix')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'matrix' ? 'bg-white text-school-primary shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Table className="w-4 h-4 mr-2" /> สรุปรายบุคคล
              </button>
           </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">ช่วงเวลา</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border-slate-300 rounded-xl border p-2.5 text-sm w-40 focus:ring-school-primary"
          >
            <option value="month">รายเดือน</option>
            <option value="year">รายปี (ปฏิทิน)</option>
            <option value="fiscal_half">รอบการประเมิน (ครึ่งปี)</option>
          </select>
        </div>

        {filterType === 'month' && (
           <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">เดือน</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border-slate-300 rounded-xl border p-2.5 text-sm w-40 focus:ring-school-primary"
            >
              {thaiMonths.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        )}

        {filterType === 'fiscal_half' && (
           <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">รอบที่</label>
            <select 
              value={fiscalHalf} 
              onChange={(e) => setFiscalHalf(Number(e.target.value) as 1 | 2)}
              className="border-slate-300 rounded-xl border p-2.5 text-sm w-48 focus:ring-school-primary"
            >
              <option value={1}>ครั้งที่ 1 (ต.ค. - มี.ค.)</option>
              <option value={2}>ครั้งที่ 2 (เม.ย. - ก.ย.)</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">ปี (ค.ศ.)</label>
          <input 
            type="number" 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border-slate-300 rounded-xl border p-2.5 text-sm w-28 focus:ring-school-primary"
            placeholder="2025"
          />
        </div>
      </div>

      {/* Printable Area */}
      <div id="printable-area" className="bg-white p-8 shadow-sm rounded-2xl print:shadow-none print:p-0 print:w-full border border-slate-200 print:border-none">
        
        <div className="text-center mb-8">
          <img src="https://img5.pic.in.th/file/secure-sv1/5bc66fd0-c76e-41c4-87ed-46d11f4a36fa.png" alt="Logo" className="h-24 w-24 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">
             แบบสรุปวันลาของข้าราชการครูและบุคลากรทางการศึกษา
          </h1>
          <h2 className="text-xl font-medium text-gray-700">โรงเรียนประจักษ์ศิลปาคม</h2>
          <p className="text-gray-600 mt-2 font-medium">
            {getReportSubtitle()}
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
                  <th rowSpan={2} className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100 w-16">รวม (ครั้ง)</th>
                  <th rowSpan={2} className="px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300 bg-blue-100 print:bg-blue-100 w-16">รวม (วัน)</th>
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
                {summaryData.length > 0 ? (
                  <>
                    {summaryData.map((person, index) => (
                      <tr key={person.name} className="hover:bg-gray-50 transition-colors print:hover:bg-transparent">
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 border border-gray-300 text-center">{index + 1}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300 text-left">{person.name}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 border border-gray-300 text-center">{person.position}</td>
                        
                        <td className="px-2 py-2 text-center text-sm border border-gray-300">{renderCell(person.sick)}</td>
                        <td className="px-2 py-2 text-center text-sm border border-gray-300">{renderCell(person.personal)}</td>
                        <td className="px-2 py-2 text-center text-sm border border-gray-300">{renderCell(person.vacation)}</td>
                        <td className="px-2 py-2 text-center text-sm border border-gray-300">{renderCell(person.birth)}</td>
                        <td className="px-2 py-2 text-center text-sm border border-gray-300">{renderCell(person.other)}</td>
                        
                        <td className="px-2 py-2 text-center text-sm font-bold text-gray-700 border border-gray-300 bg-gray-50">{person.totalTimes}</td>
                        <td className="px-2 py-2 text-center text-sm font-bold text-blue-700 border border-gray-300 bg-blue-50/50">{person.total}</td>
                      </tr>
                    ))}
                    {/* Grand Total Row inside tbody */}
                    <tr className="bg-gray-100 font-bold border-t-2 border-gray-400 print:bg-gray-100 break-inside-avoid">
                      <td colSpan={3} className="px-2 py-2 text-right border border-gray-300">รวมทั้งหมด</td>
                      <td className="px-2 py-2 text-center border border-gray-300">{renderCell(summaryData.reduce((a, b) => a + b.sick, 0))}</td>
                      <td className="px-2 py-2 text-center border border-gray-300">{renderCell(summaryData.reduce((a, b) => a + b.personal, 0))}</td>
                      <td className="px-2 py-2 text-center border border-gray-300">{renderCell(summaryData.reduce((a, b) => a + b.vacation, 0))}</td>
                      <td className="px-2 py-2 text-center border border-gray-300">{renderCell(summaryData.reduce((a, b) => a + b.birth, 0))}</td>
                      <td className="px-2 py-2 text-center border border-gray-300">{renderCell(summaryData.reduce((a, b) => a + b.other, 0))}</td>
                      <td className="px-2 py-2 text-center border border-gray-300">{summaryData.reduce((a, b) => a + b.totalTimes, 0)}</td>
                      <td className="px-2 py-2 text-center border border-gray-300 text-blue-800">{summaryData.reduce((a, b) => a + b.total, 0)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-sm text-gray-500 italic">ไม่พบข้อมูล</td>
                  </tr>
                )}
              </tbody>
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