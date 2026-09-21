import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Student } from '../../types/database.types';
import { studentService } from './studentService';
import { Save, User, Phone, MapPin, Calendar, Hash, Award } from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSaved: (msg: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaved,
}) => {
  const [studentCode, setStudentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [teamNumber, setTeamNumber] = useState<number>(1);
  const [roleInClass, setRoleInClass] = useState('Học sinh');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setStudentCode(student.student_code || '');
      setFullName(student.full_name || '');
      setDob(student.dob || '');
      setGender(student.gender || 'Nam');
      setTeamNumber(student.team_number || 1);
      setRoleInClass(student.role_in_class || 'Học sinh');
      setParentName(student.parent_name || '');
      setParentPhone(student.parent_phone || '');
      setAddress(student.address || '');
      setAvatarUrl(student.avatar_url || '');
    } else {
      // Defaults for new student
      setStudentCode('');
      setFullName('');
      setDob('2016-01-01');
      setGender('Nam');
      setTeamNumber(1);
      setRoleInClass('Học sinh');
      setParentName('');
      setParentPhone('');
      setAddress('');
      setAvatarUrl('');
    }
    setError(null);
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim() || !fullName.trim()) {
      setError('Vui lòng nhập Mã học sinh và Họ tên');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await studentService.upsertStudent({
        id: student?.id,
        student_code: studentCode.trim(),
        full_name: fullName.trim(),
        dob: dob || undefined,
        gender,
        team_number: teamNumber,
        role_in_class: roleInClass.trim(),
        parent_name: parentName.trim() || undefined,
        parent_phone: parentPhone.trim() || undefined,
        address: address.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      });

      onSaved(student ? 'Đã cập nhật thông tin học sinh!' : 'Đã thêm học sinh mới thành công!');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi lưu thông tin học sinh!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? `Chỉnh sửa: ${student.full_name}` : 'Thêm Học Sinh Mới Vào Lớp 5/4'}
      subtitle="Điền thông tin chi tiết học sinh và thông tin liên lạc phụ huynh"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mã HS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mã Học Sinh <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="VD: 5401, 5402..."
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Họ tên */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và Tên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Hoàng Nam"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-semibold"
              />
            </div>
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ngày Sinh
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Giới Tính
            </label>
            <div className="flex space-x-3 pt-1">
              {(['Nam', 'Nữ'] as const).map((g) => (
                <label key={g} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Phân Tổ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tổ Học Tập
            </label>
            <select
              value={teamNumber}
              onChange={(e) => setTeamNumber(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value={1}>Tổ 1</option>
              <option value={2}>Tổ 2</option>
              <option value={3}>Tổ 3</option>
              <option value={4}>Tổ 4</option>
            </select>
          </div>

          {/* Chức vụ trong lớp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chức Vụ Ban Cán Sự
            </label>
            <div className="relative">
              <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Học sinh, Lớp trưởng, Tổ trưởng..."
                value={roleInClass}
                onChange={(e) => setRoleInClass(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Họ tên phụ huynh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ Tên Phụ Huynh (Bố / Mẹ)
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn Hùng"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* SĐT phụ huynh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số Điện Thoại Phụ Huynh
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                placeholder="VD: 0912345678"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Địa Chỉ Thường Trú
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-2 shadow-md shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Đang lưu...' : 'Lưu Thông Tin'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
