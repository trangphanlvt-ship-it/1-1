import React, { useState, useEffect } from 'react';
import { Notice } from '../../types/database.types';
import { noticeService } from './noticeService';
import { useAuth } from '../../context/AuthContext';
import { NoticeCreateModal } from './NoticeCreateModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateVN } from '../../utils/formatters';
import { 
  BellRing, 
  PlusCircle, 
  Search, 
  Pin, 
  CheckCircle, 
  Calendar, 
  UserCheck, 
  Edit, 
  Trash2, 
  Tag
} from 'lucide-react';

interface NoticeBoardProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ onShowToast }) => {
  const { role, profile, user } = useAuth();
  const canEdit = role === 'teacher' || role === 'admin';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await noticeService.getNotices(profile?.id || user?.id);
      setNotices(data);
    } catch (err: any) {
      console.error(err);
      onShowToast('Lỗi khi tải bảng dặn dò!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [profile?.id, user?.id]);

  const handleDelete = async (notice: Notice) => {
    if (!window.confirm(`Xác nhận xóa bài dặn dò: "${notice.title}"?`)) return;
    try {
      await noticeService.deleteNotice(notice.id);
      onShowToast('Đã xóa bài dặn dò!', 'success');
      fetchNotices();
    } catch (err: any) {
      console.error(err);
      onShowToast('Lỗi khi xóa bài dặn dò!', 'error');
    }
  };

  const handleToggleConfirm = async (notice: Notice) => {
    if (!profile?.id && !user?.id) {
      onShowToast('Vui lòng đăng nhập để xác nhận đã hoàn thành bài dặn dò!', 'info');
      return;
    }
    const targetProfileId = profile?.id || user?.id!;

    try {
      if (notice.is_confirmed_by_me) {
        await noticeService.unconfirmNotice(notice.id, targetProfileId);
        onShowToast('Đã bỏ đánh dấu hoàn thành', 'info');
      } else {
        await noticeService.confirmNotice(notice.id, targetProfileId);
        onShowToast('Tuyệt vời! Em đã hoàn thành dặn dò này 🎉', 'success');
      }
      fetchNotices();
    } catch (err: any) {
      console.error(err);
      onShowToast('Lỗi cập nhật trạng thái dặn dò', 'error');
    }
  };

  // Filter
  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === 'all' || n.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = Array.from(new Set(notices.map((n) => n.subject))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-2">
            <BellRing className="w-3.5 h-3.5 text-amber-200" />
            <span>Góc Dặn Dò & Bài Tập Về Nhà</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Sổ Dặn Dò Hàng Ngày Lớp 5/4
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl">
            Lời nhắn nhủ, bài tập cần hoàn thành và tài liệu học tập do Cô Phan Thị Diễm Trang trực tiếp cập nhật.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setEditingNotice(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white text-amber-900 text-xs font-extrabold hover:bg-amber-50 transition-all shadow-md self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Đăng Dặn Dò Mới</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm kiếm lời dặn dò, môn học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Subject filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              selectedSubject === 'all'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả môn ({notices.length})
          </button>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedSubject === sub
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <LoadingSpinner message="Đang tải danh sách dặn dò lớp học..." />
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <BellRing className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Hiện chưa có bài dặn dò nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedSubject !== 'all'
              ? 'Không tìm thấy dặn dò phù hợp với từ khóa này.'
              : 'GVCN sẽ sớm đăng tải các nội dung bài học và dặn dò mới cho lớp.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => {
            return (
              <div
                key={notice.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  notice.is_important
                    ? 'border-amber-300 ring-2 ring-amber-100/80 bg-gradient-to-b from-amber-50/40 to-white'
                    : 'border-slate-200 hover:border-sky-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {notice.is_important && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-extrabold border border-rose-200">
                          <Pin className="w-3 h-3 fill-rose-600" />
                          <span>QUAN TRỌNG</span>
                        </span>
                      )}
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200">
                        <Tag className="w-3 h-3" />
                        <span>{notice.subject}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateVN(notice.target_date)}</span>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">
                    {notice.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mb-3">
                    Người đăng: <strong className="text-slate-600">{notice.author_name}</strong>
                  </p>

                  {/* Content with line-breaks */}
                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    {notice.content}
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  {/* Completion confirmation button */}
                  <button
                    onClick={() => handleToggleConfirm(notice)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      notice.is_confirmed_by_me
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent'
                    }`}
                  >
                    <CheckCircle className={`w-4 h-4 ${notice.is_confirmed_by_me ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{notice.is_confirmed_by_me ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {notice.confirmations_count !== undefined && notice.confirmations_count > 0 && (
                      <span className="text-[11px] text-slate-500 font-medium flex items-center space-x-1" title="Số lượng học sinh đã hoàn thành">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{notice.confirmations_count} đã xem</span>
                      </span>
                    )}

                    {canEdit && (
                      <div className="flex items-center space-x-1 border-l border-slate-200 pl-2">
                        <button
                          onClick={() => {
                            setEditingNotice(notice);
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-sky-600"
                          title="Sửa bài dặn dò"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(notice)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                          title="Xóa bài dặn dò"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Modal */}
      <NoticeCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notice={editingNotice}
        onSaved={(msg) => {
          onShowToast(msg, 'success');
          fetchNotices();
        }}
      />
    </div>
  );
};
