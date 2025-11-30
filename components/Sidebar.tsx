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
        ? 'bg-white text-indigo-600 shadow-lg'
        : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
    }`;

  return (
    <div className="w-72 bg-indigo-600 shadow-xl h-full flex flex-col no-print border-r border-indigo-500">
      <div className="p-8 border-b border-indigo-500 flex flex-col items-center bg-gradient-to-b from-indigo-600 to-indigo-700">
         <div className="relative">
            {/* White circle background for logo */}
            <div className="bg-white rounded-full p-3 shadow-md mb-3 relative z-10">
                <img src="https://img5.pic.in.th/file/secure-sv1/5bc66fd0-c76e-41c4-87ed-46d11f4a36fa.png" alt="Logo" className="h-16 w-16" />
            </div>
         </div>
         <h2 className="font-bold text-white text-center text-lg leading-tight mt-2">โรงเรียนประจักษ์ศิลปาคม</h2>
         <p className="text-xs text-indigo-200 font-medium tracking-wide mt-1">LEAVE MANAGEMENT SYSTEM</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-2 custom-scrollbar">
        <div className="px-4 mb-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">เมนูหลัก</div>
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
            <div className="mt-8 mb-2 px-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">
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

      <div className="p-5 border-t border-indigo-500 text-center">
         <p className="text-xs text-indigo-300">
            &copy; 2025 Prajak Sillapakom<br/>
            All rights reserved.
         </p>
      </div>
    </div>
  );
};

export default Sidebar;