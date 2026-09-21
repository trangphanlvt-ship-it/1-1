import React, { useState, useEffect } from 'react';
import { Student } from '../../types/database.types';
import { studentService } from './studentService';
import { useAuth } from '../../context/AuthContext';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentImportExcel } from './StudentImportExcel';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateVN, getInitials, getTeamBadgeColor } from '../../utils/formatters';
import { 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  Calendar, 
  Award,
  Grid,
  List
} from 'lucide-react';

interface StudentListProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StudentList: React.FC<StudentListProps> = ({ onShowToast }) => {
  const { role } = useAuth();
  const canEdit = role === 'teacher' || role === 'admin';

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<number | 'all'>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getStudents();
      setStudents(data);
    } catch (err: any) {
      console.error(err);
      onShowToast('Không thể tải danh sách học sinh. Vui lòng kiểm tra lại kết nối Supabase!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${student.full_name}" khỏi danh sách?`)) {
      return;
    }
    try {
      await studentService.deleteStudent(student.id);
      onShowToast(`Đã xóa học sinh ${student.full_name}`, 'success');
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      onShowToast('Lỗi khi xóa học sinh!', 'error');
    }
  };

  const handleExportExcel = () => {
    if (students.length === 0) {
      onShowToast('Danh sách học sinh đang trống!', 'info');
      return;
    }
    studentService.exportToExcel(students);
    onShowToast('Đã tải xuống danh sách học sinh Lớp 5/4 thành công!', 'success');
  };

  // Filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.parent_phone && s.parent_phone.includes(searchQuery));

    const matchesTeam = selectedTeam === 'all' || s.team_number === selectedTeam;
    const matchesGender = selectedGender === 'all' || s.gender === selectedGender;

    return matchesSearch && matchesTeam && matchesGender;
  });

  // Calculate stats
  const totalCount = students.length;
  const maleCount = students.filter((s) => s.gender === 'Nam').length;
  const femaleCount = students.filter((s) => s.gender === 'Nữ').length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-600/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-2">
              <Users className="w-3.5 h-3.5 text-sky-200" />
              <span>Quản Lý Hồ Sơ Học Sinh</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Danh Sách Học Sinh Lớp 5/4
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
              Năm học 2026 - 2027 • Trường Tiểu học Lê Văn Tám • GVCN: Cô Phan Thị Diễm Trang
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-sm border border-white/20 transition-all shadow-sm"
              title="Xuất file Excel"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>

            {canEdit && (
              <>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/25"
                  title="Nhập danh sách từ Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Nhập Excel</span>
                </button>

                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setIsDetailModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-extrabold transition-all shadow-md shadow-amber-400/25"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Thêm Học Sinh</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <p className="text-[11px] text-sky-200 font-medium">Tổng Sĩ Số Lớp</p>
            <p className="text-xl sm:text-2xl font-black mt-0.5">{totalCount} <span className="text-xs font-normal">học sinh</span></p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <p className="text-[11px] text-sky-200 font-medium">Học Sinh Nam</p>
            <p className="text-xl sm:text-2xl font-black mt-0.5">{maleCount} <span className="text-xs font-normal">em ({totalCount ? Math.round((maleCount/totalCount)*100) : 0}%)</span></p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <p className="text-[11px] text-sky-200 font-medium">Học Sinh Nữ</p>
            <p className="text-xl sm:text-2xl font-black mt-0.5">{femaleCount} <span className="text-xs font-normal">em ({totalCount ? Math.round((femaleCount/totalCount)*100) : 0}%)</span></p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <p className="text-[11px] text-sky-200 font-medium">Phân Tổ Học Tập</p>
            <p className="text-xl sm:text-2xl font-black mt-0.5">4 <span className="text-xs font-normal">Tổ thi đua</span></p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã HS, phụ huynh, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Team filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setSelectedTeam('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${selectedTeam === 'all' ? 'bg-white text-sky-700 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Tất cả tổ
            </button>
            {[1, 2, 3, 4].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTeam(t)}
                className={`px-2.5 py-1 rounded-lg transition-all ${selectedTeam === t ? 'bg-white text-sky-700 shadow-sm' : 'hover:text-slate-900'}`}
              >
                Tổ {t}
              </button>
            ))}
          </div>

          {/* Gender filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 bg-white"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          {/* View Mode */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl text-slate-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white text-sky-600 shadow-sm' : ''}`}
              title="Xem dạng thẻ"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white text-sky-600 shadow-sm' : ''}`}
              title="Xem dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Students Data Display */}
      {loading ? (
        <LoadingSpinner message="Đang tải danh sách học sinh Lớp 5/4..." />
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy học sinh nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedTeam !== 'all' || selectedGender !== 'all'
              ? 'Không có học sinh nào phù hợp với bộ lọc tìm kiếm hiện tại.'
              : 'Chưa có học sinh nào trong cơ sở dữ liệu. Giáo viên có thể bấm "Nhập Excel" hoặc "Thêm Học Sinh" để bắt đầu.'}
          </p>
          {canEdit && students.length === 0 && (
            <div className="mt-4 flex items-center justify-center space-x-3">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700"
              >
                Nhập danh sách từ Excel
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((s) => {
            const teamBadge = getTeamBadgeColor(s.team_number);
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top card row: Code + Team Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      #{s.student_code}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${teamBadge.bg} ${teamBadge.text} ${teamBadge.border}`}>
                      Tổ {s.team_number}
                    </span>
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-sky-500/15 flex-shrink-0">
                      {s.avatar_url ? (
                        <img src={s.avatar_url} alt={s.full_name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        getInitials(s.full_name)
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-tight">
                        {s.full_name}
                      </h4>
                      <p className="text-[11px] text-amber-600 font-semibold flex items-center space-x-1 mt-0.5">
                        <Award className="w-3 h-3 inline" />
                        <span>{s.role_in_class || 'Học sinh'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Ngày sinh:</span>
                      </span>
                      <span className="font-medium text-slate-700">{formatDateVN(s.dob)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Giới tính:</span>
                      <span className="font-medium text-slate-700">{s.gender}</span>
                    </div>

                    {s.parent_name && (
                      <div className="text-[11px] text-slate-500 truncate pt-1">
                        <span className="text-slate-400">PH: </span>
                        <span className="font-medium text-slate-700">{s.parent_name}</span>
                        {s.parent_phone && (
                          <span className="text-sky-600 font-mono ml-1 font-semibold">({s.parent_phone})</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions for teacher/admin */}
                {canEdit && (
                  <div className="flex items-center justify-end space-x-1 pt-3 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingStudent(s);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Xóa học sinh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Mã HS</th>
                  <th className="p-3.5">Họ và Tên</th>
                  <th className="p-3.5">Tổ</th>
                  <th className="p-3.5">Chức vụ</th>
                  <th className="p-3.5">Ngày sinh</th>
                  <th className="p-3.5">Giới tính</th>
                  <th className="p-3.5">Phụ huynh & SĐT</th>
                  <th className="p-3.5">Địa chỉ</th>
                  {canEdit && <th className="p-3.5 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const teamBadge = getTeamBadgeColor(s.team_number);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-sky-700">#{s.student_code}</td>
                      <td className="p-3.5 font-bold text-slate-900">{s.full_name}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${teamBadge.bg} ${teamBadge.text} ${teamBadge.border}`}>
                          Tổ {s.team_number}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-amber-700">{s.role_in_class || 'Học sinh'}</td>
                      <td className="p-3.5 text-slate-600">{formatDateVN(s.dob)}</td>
                      <td className="p-3.5 text-slate-600">{s.gender}</td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">{s.parent_name || '—'}</div>
                        {s.parent_phone && <div className="text-slate-400 font-mono">{s.parent_phone}</div>}
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">{s.address || '—'}</td>
                      {canEdit && (
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingStudent(s);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-sky-600"
                            title="Sửa"
                          >
                            <Edit className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        student={editingStudent}
        onSaved={(msg) => {
          onShowToast(msg, 'success');
          fetchStudents();
        }}
      />

      <StudentImportExcel
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(msg) => {
          onShowToast(msg, 'success');
          fetchStudents();
        }}
      />
    </div>
  );
};
