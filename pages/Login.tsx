import React, { useState } from 'react';
import { authenticate } from '../services/dataService';
import { User } from '../types';
import { Lock, User as UserIcon, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const user = await authenticate(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
         <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sapphire Blue Card */}
      <div className="bg-[#0f52ba]/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20 z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-white shadow-md mb-4">
             <img src="https://img5.pic.in.th/file/secure-sv1/5bc66fd0-c76e-41c4-87ed-46d11f4a36fa.png" alt="Logo" className="h-20 w-20 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white">ระบบบันทึกการลา</h1>
          <p className="text-blue-100 font-medium opacity-90">โรงเรียนประจักษ์ศิลปาคม</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm text-center font-bold shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-blue-50 mb-2">ชื่อผู้ใช้งาน</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-xl leading-5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all shadow-sm"
                placeholder="ระบุชื่อผู้ใช้งาน"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-50 mb-2">รหัสผ่าน</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-xl leading-5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all shadow-sm"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-blue-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-8 text-xs text-blue-200 text-center font-medium opacity-80">
          <p>ตัวอย่างการเข้าระบบ: ภราดร / PJ123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;