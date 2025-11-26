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
    `flex items-center px-4 py-3 text-sm font-medium transition-all rounded-xl mx-2 mb-1 ${
      isActive
        ? 'bg-school-primary text-white shadow-md shadow-blue-900/20'
        : 'text-slate-600 hover:bg-slate-50 hover:text-school-primary'
    }`;

  return (
    <div className="w-72 bg-white shadow-xl h-full flex flex-col no-print border-r border-slate-200">
      <div className="p-8 border-b border-slate-100 flex flex-col items-center bg-gradient-to-b from-white to-slate-50">
         <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
            <img src="https://img5.pic.in.th/file/secure-sv1/5bc66fd0-c76e-41c4-87ed-46d11f4a36fa.png" alt="Logo" className="h-20 w-20 mb-3 relative z-10 drop-shadow-md" />
         </div>
         <h2 className="font-bold text-slate-800 text-center text-lg leading-tight mt-2">โรงเรียนประจักษ์ศิลปาคม</h2>
         <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">LEAVE MANAGEMENT SYSTEM</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-2 custom-scrollbar">
        <div className="px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">เมนูหลัก</div>
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
            <div className="mt-8 mb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              ผู้ดูแลระบบ
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

      <div className="p-5 border-t border-slate-100 text-center">
         <p className="text-xs text-slate-400">
            &copy; 2025 Prajak Sillapakom<br/>
            All rights reserved.
         </p>
      </div>
    </div>
  );
};

export default Sidebar;