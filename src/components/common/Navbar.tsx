import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  BellRing, 
  Trophy, 
  Images, 
  Home, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  Menu,
  X,
  Settings,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 'overview' | 'students' | 'notices' | 'competition' | 'gallery';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAuthModal: () => void;
  onOpenConfigModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuthModal,
  onOpenConfigModal,
}) => {
  const { user, profile, role, signOut, isConfigured, setDemoRole, demoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'overview' as NavTab, label: 'Tổng quan', icon: Home },
    { id: 'students' as NavTab, label: 'Học sinh', icon: Users },
    { id: 'notices' as NavTab, label: 'Dặn dò', icon: BellRing },
    { id: 'competition' as NavTab, label: 'Thi đua tuần', icon: Trophy },
    { id: 'gallery' as NavTab, label: 'Ảnh hoạt động', icon: Images },
  ];

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return { label: 'Admin (Quản trị)', bg: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'teacher':
        return { label: 'GVCN (Cô Trang)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'student':
      default:
        return { label: 'Học sinh / Phụ huynh', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 text-white text-xs sm:text-sm py-1.5 px-4 text-center font-medium shadow-inner flex items-center justify-center space-x-2">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>Lớp 5/4 • Năm học 2026-2027 • GVCN: Cô Phan Thị Diễm Trang • TH Lê Văn Tám</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School/Class title */}
          <div 
            onClick={() => onSelectTab('overview')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-slate-800 tracking-tight group-hover:text-sky-600 transition-colors">
                  Lớp 5/4
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-semibold">
                  2026-2027
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
                Trường Tiểu học Lê Văn Tám
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-600 shadow-sm border border-sky-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile / Role / Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Supabase Status Config button */}
            {!isConfigured && (
              <button
                onClick={onOpenConfigModal}
                className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors"
                title="Cấu hình kết nối Supabase"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Cấu hình DB</span>
              </button>
            )}

            {/* Role Switcher Test Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${roleInfo.bg}`}
                title="Nhấp để chuyển vai trò thử nghiệm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{roleInfo.label}</span>
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Chuyển vai trò xem thử
                  </div>
                  <button
                    onClick={() => { setDemoRole('teacher'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-amber-50 text-slate-700 flex items-center justify-between"
                  >
                    <span>👩‍🏫 Giáo viên chủ nhiệm</span>
                    {role === 'teacher' && <span className="text-amber-600">✓</span>}
                  </button>
                  <button
                    onClick={() => { setDemoRole('admin'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-rose-50 text-slate-700 flex items-center justify-between"
                  >
                    <span>👑 Quản trị viên (Admin)</span>
                    {role === 'admin' && <span className="text-rose-600">✓</span>}
                  </button>
                  <button
                    onClick={() => { setDemoRole('student'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-sky-50 text-slate-700 flex items-center justify-between"
                  >
                    <span>🎒 Học sinh / Phụ huynh</span>
                    {role === 'student' && <span className="text-sky-600">✓</span>}
                  </button>
                  {demoRole && (
                    <button
                      onClick={() => { setDemoRole(null); setRoleDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 border-t border-slate-100 mt-1"
                    >
                      ↩ Khôi phục vai trò gốc
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:from-sky-600 hover:to-blue-700 transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${roleInfo.bg}`}>
              {roleInfo.label}
            </span>
            {!isConfigured && (
              <button
                onClick={() => { onOpenConfigModal(); setMobileMenuOpen(false); }}
                className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded"
              >
                Cấu hình DB
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-600 border border-sky-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
                  {profile?.full_name || user.email}
                </span>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="text-xs font-bold text-rose-600 flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onOpenAuthModal(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold text-center flex items-center justify-center space-x-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập / Đăng ký</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
