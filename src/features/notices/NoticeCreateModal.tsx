import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Notice } from '../../types/database.types';
import { noticeService } from './noticeService';
import { useAuth } from '../../context/AuthContext';
import { Save, AlertCircle, Calendar, BookOpen, Bell } from 'lucide-react';

interface NoticeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: Notice | null;
  onSaved: (msg: string) => void;
}

const SUBJECT_OPTIONS = [
  'Chung',
  'Toán',
  'Tiếng Việt',
  'Tiếng Anh',
  'Khoa học',
  'Lịch sử & Địa lí',
  'Tin học & Công nghệ',
  'Đạo đức',
  'Hoạt động trải nghiệm',
  'Sinh hoạt lớp'
];

export const NoticeCreateModal: React.FC<NoticeCreateModalProps> = ({
  isOpen,
  onClose,
  notice,
  onSaved,
}) => {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('Chung');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [isImportant, setIsImportant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (notice) {
      setTitle(notice.title);
      setContent(notice.content);
      setSubject(notice.subject || 'Chung');
      setTargetDate(notice.target_date || new Date().toISOString().split('T')[0]);
      setIsImportant(notice.is_important || false);
    } else {
      setTitle('');
      setContent('');
      setSubject('Chung');
      setTargetDate(new Date().toISOString().split('T')[0]);
      setIsImportant(false);
    }
    setError(null);
  }, [notice, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung dặn dò');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (notice) {
        await noticeService.updateNotice(notice.id, {
          title: title.trim(),
          content: content.trim(),
          subject,
          target_date: targetDate,
          is_important: isImportant,
        });
        onSaved('Đã cập nhật bài dặn dò!');
      } else {
        await noticeService.createNotice({
          title: title.trim(),
          content: content.trim(),
          subject,
          target_date: targetDate,
          is_important: isImportant,
          author_name: profile?.full_name || 'Cô Phan Thị Diễm Trang',
          author_id: profile?.id,
        });
        onSaved('Đã đăng bài dặn dò mới cho lớp 5/4!');
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi lưu dặn dò!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={notice ? 'Chỉnh Sửa Bài Dặn Dò' : 'Đăng Dặn Dò Mới Cho Lớp 5/4'}
      subtitle="GVCN dặn dò bài tập, tài liệu hoặc nhắc nhở học sinh và phụ huynh"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tiêu Đề Dặn Dò / Bài Tập <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Bell className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              placeholder="VD: Dặn dò chuẩn bị bài Ngày mai (22/09) & Bài tập Toán trang 45"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-bold"
            />
          </div>
        </div>

        {/* Grid row: Subject + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phân Môn / Chủ Đề
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-medium"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Áp Dụng Cho Ngày
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Chi Tiết Lời Dặn Dò & Yêu Cầu <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            placeholder="Ví dụ:&#10;1. Môn Toán: Hoàn thành bài 1, 2, 3 trang 45 vở bài tập.&#10;2. Tiếng Việt: Đọc thuộc lòng bài thơ 'Hạt gạo làng ta'.&#10;3. Chuẩn bị thước kẻ và giấy màu cho tiết Hoạt động trải nghiệm ngày mai."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 leading-relaxed font-sans"
          />
        </div>

        {/* Important Checkbox */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <span className="text-xs font-bold text-amber-900">
              Đánh dấu là Thông báo / Dặn dò QUAN TRỌNG (Ghim nổi bật)
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-1.5 shadow-md shadow-sky-500/25 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Đang lưu...' : 'Lưu & Đăng Dặn Dò'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
