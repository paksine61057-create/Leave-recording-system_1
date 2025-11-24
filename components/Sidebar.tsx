import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Users, FileText, History, ShieldCheck } from 'lucide-react';
import { User, Role } from '../types';

interface SidebarProps {
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const isAdmin = user.role === Role.ADMIN;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium transition-all rounded-r-full mr-2 ${
      isActive
        ? 'bg-blue-50 text-school-primary border-l-4 border-school-primary shadow-sm'
        : 'text-gray-600 hover:bg-gray-50 hover:text-school-primary hover:pl-5'
    }`;

  return (
    <div className="w-64 bg-white shadow-xl h-full flex flex-col no-print border-r border-gray-100">
      <div className="p-6 border-b border-gray-100 flex flex-col items-center bg-gradient-to-b from-white to-blue-50/30">
         <img src="https://img5.pic.in.th/file/secure-sv1/5bc66fd0-c76e-41c4-87ed-46d11f4a36fa.png" alt="Logo" className="h-20 w-20 mb-3 drop-shadow-sm" />
         <h2 className="font-bold text-gray-800 text-center leading-tight">ระบบบริหารจัดการ<br/><span className="text-school-primary">การลา</span></h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 space-y-1">
        <NavLink to="/" className={linkClass}>
          <LayoutDashboard className="mr-3 h-5 w-5" />
          ภาพรวมสถิติ
        </NavLink>
        
        <NavLink to="/history" className={linkClass}>
          <History className="mr-3 h-5 w-5" />
          ประวัติการลา
        </NavLink>

        {isAdmin && (
          <>
            <div className="mt-6 mb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">
              ส่วนของผู้ดูแล
            </div>
            <NavLink to="/leave-entry" className={linkClass}>
              <FilePlus className="mr-3 h-5 w-5" />
              บันทึกการลา
            </NavLink>
            <NavLink to="/personnel" className={linkClass}>
              <Users className="mr-3 h-5 w-5" />
              จัดการข้อมูลบุคลากร
            </NavLink>
            <NavLink to="/reports" className={linkClass}>
              <FileText className="mr-3 h-5 w-5" />
              รายงานสรุป
            </NavLink>
            <NavLink to="/access-logs" className={linkClass}>
              <ShieldCheck className="mr-3 h-5 w-5" />
              ประวัติการเข้าใช้งาน
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-400 bg-gray-50/50">
        &copy; 2025 Prajak Sillapakom
      </div>
    </div>
  );
};

export default Sidebar;