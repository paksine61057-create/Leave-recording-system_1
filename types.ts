export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  username: string;
  role: Role;
  fullName: string;
}

export interface Staff {
  id: string;
  name: string;
  position: string;
}

export interface LeaveRecord {
  id: string;
  staffId: string;
  staffName: string;
  position: string;
  leaveType: string;
  dates: string[]; // ISO Date strings
  filedDate: string; // Date the leave was filed/signed
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  note: string;
  createdAt: string;
}

export interface AccessLog {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  timestamp: string;
}

export const POSITIONS = [
  "ผู้อำนวยการ",
  "รองผู้อำนวยการ",
  "ครูชำนาญการพิเศษ",
  "ครูชำนาญการ",
  "ครู",
  "ครูผู้ช่วย",
  "ลูกจ้างประจำ",
  "ครูธุรการ",
  "ครูอัตราจ้าง"
];

export const LEAVE_TYPES = [
  "การลาป่วย",
  "การลาคลอดบุตร",
  "การลาไปช่วยเหลือภริยาที่คลอดบุตร",
  "การลากิจส่วนตัว",
  "การลาพักผ่อน",
  "การลาอุปสมบทหรือประกอบพิธีฮัจย์",
  "การลาเข้ารับการตรวจเลือกหรือเตรียมพล",
  "การลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน",
  "การลาไปปฏิบัติงานในองค์การระหว่างประเทศ",
  "การลาติดตามคู่สมรส",
  "การลาไปฟื้นฟูสมรรถภาพด้านอาชีพ"
];

// Initial Staff Data
export const INITIAL_STAFF_NAMES = [
  "นางชัชตะวัน สีเขียว",
  "นายภราดร คัณทักษ์",
  "นางทิวาวรรณ กองแก้ว",
  "นายบุญจันทร์ สุวรรณพรม",
  "นายอภิชาติ ชุมพล",
  "นายภาคภูมิ พงษ์สิทธิศักดิ์",
  "นางวัชรี พิมพ์ศรี",
  "นางบุญญาภรณ์ ธิตานนท์",
  "นางสาวอัญชนีย์ วงศ์วาน",
  "นางวลัยรัตน์ แนวบุตร",
  "นายยุทธไกร อ่างแก้ว",
  "นางสาวเสาวภา สิงหเสนา",
  "นางสาวกันต์ฤทัย นามมาลา",
  "นางสาวสุภาภรณ์ ลัพธะลักษ์",
  "นายจักรพงษ์ ไชยราช",
  "ว่าที่ ร.ต.วิษณุ โสภา",
  "นายบุญเสริม สาทไทสงค์",
  "นายอุดมวิทย์ บุพิ",
  "นายพงษ์เพชร แซ่ตั้ง",
  "นางสาวชลฎา บุตรเนียน",
  "นางสาวปภัสพ์มณ ทองอาสา",
  "นายศราวุธ ศรีวงราช",
  "นางสาวตรีนัทธ์ธนา บุญโท",
  "นางสาวศิรินภา นาแว่น",
  "นายวชิรวิทย์ นันทชัย"
];