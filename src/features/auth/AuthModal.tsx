import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/database.types';
import { LogIn, UserPlus, ShieldAlert, Sparkles, KeyRound, Mail, User, Phone, BookCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [studentCode, setStudentCode] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          throw new Error('Vui lòng nhập họ và tên');
        }
        const { error } = await signUp(
          email.trim(),
          password,
          fullName.trim(),
          role,
          studentCode.trim() || undefined,
          phone.trim() || undefined
        );
        if (error) throw error;
        onSuccess('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
        setIsRegister(false);
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
        onSuccess('Đăng nhập thành công!');
        onClose();
      }
    } catch (err: any) {
      console.error('Lỗi xác thực:', err);
      let msg = err.message || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin!';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Email hoặc mật khẩu không chính xác!';
      } else if (msg.includes('User already registered')) {
        msg = 'Email này đã được đăng ký tài khoản!';
      } else if (msg.includes('Password should be at least 6 characters')) {
        msg = 'Mật khẩu cần tối thiểu 6 ký tự!';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Đăng Ký Tài Khoản Mới' : 'Đăng Nhập Hệ Thống Lớp 5/4'}
      subtitle={isRegister ? 'Tạo tài khoản dành cho Học sinh, Phụ huynh hoặc Giáo viên' : 'Nhập tài khoản email và mật khẩu của bạn'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Register-only fields */}
        {isRegister && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vai trò của bạn <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    role === 'student'
                      ? 'bg-sky-50 border-sky-500 text-sky-700 ring-2 ring-sky-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🎒 Học sinh / PH
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    role === 'teacher'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  👩‍🏫 Giáo viên
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    role === 'admin'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  👑 Admin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và Tên <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phan Thị Diễm Trang hoặc Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            {role === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã Học Sinh (nếu có)
                </label>
                <div className="relative">
                  <BookCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Ví dụ: 5401, 5402..."
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại liên hệ
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="Ví dụ: 0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Email tài khoản <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              placeholder="tenban@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span>Đang xử lý...</span>
          ) : isRegister ? (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Đăng Ký Tài Khoản</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập Ngay</span>
            </>
          )}
        </button>

        {/* Toggle switch between login and register */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage(null);
            }}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {isRegister
                ? 'Đã có tài khoản? Nhấn để Đăng nhập'
                : 'Chưa có tài khoản? Nhấn để Đăng ký mới'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
