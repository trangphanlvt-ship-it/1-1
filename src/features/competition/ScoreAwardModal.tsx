import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Student } from '../../types/database.types';
import { competitionService } from './competitionService';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { Award, Flower2, ShieldAlert, Star, ThumbsDown, CheckCircle2 } from 'lucide-react';

interface ScoreAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentWeek: number;
  onAwardSuccess: (msg: string) => void;
}

export const ScoreAwardModal: React.FC<ScoreAwardModalProps> = ({
  isOpen,
  onClose,
  students,
  currentWeek,
  onAwardSuccess,
}) => {
  const { profile } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [pointType, setPointType] = useState<'flower' | 'discipline' | 'star' | 'deduction'>('flower');
  const [points, setPoints] = useState(1);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#f59e0b', '#10b981', '#f43f5e']
      });
    } catch (e) {
      // Ignore confetti errors if canvas not supported
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError('Vui lòng chọn học sinh được khen thưởng/nhắc nhở');
      return;
    }
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do cụ thể');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await competitionService.awardPoints(
        selectedStudentId,
        currentWeek,
        pointType,
        points,
        reason.trim(),
        1,
        profile?.id
      );

      if (pointType !== 'deduction') {
        triggerConfetti();
      }

      onAwardSuccess(`Đã ghi nhận điểm thi đua cho học sinh!`);
      setReason('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi ghi nhận điểm thi đua!');
    } finally {
      setLoading(false);
    }
  };

  const pointOptions = [
    {
      id: 'flower',
      label: 'Bông Hoa Điểm Tốt / Điểm 10 (+10đ)',
      icon: Flower2,
      color: 'bg-rose-50 border-rose-300 text-rose-700',
      defaultReason: 'Đạt điểm 10 kiểm tra hoặc phát biểu xuất sắc'
    },
    {
      id: 'star',
      label: 'Ngôi Sao Khen Thưởng (+15đ)',
      icon: Star,
      color: 'bg-amber-50 border-amber-300 text-amber-800',
      defaultReason: 'Gương người tốt việc tốt / Tiến bộ vượt bậc'
    },
    {
      id: 'discipline',
      label: 'Điểm Nề Nếp & Chuyên Cần (+5đ)',
      icon: Award,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-700',
      defaultReason: 'Trực nhật lớp sạch sẽ, đi học đúng giờ'
    },
    {
      id: 'deduction',
      label: 'Nhắc Nhở / Trừ Điểm Rèn Luyện (-5đ)',
      icon: ThumbsDown,
      color: 'bg-slate-100 border-slate-300 text-slate-700',
      defaultReason: 'Nói chuyện riêng hoặc chưa chuẩn bị bài'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chấm Điểm & Khen Thưởng Thi Đua"
      subtitle={`Ghi nhận hoa điểm tốt, ngôi sao chăm ngoan trong Tuần ${currentWeek}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Select Student */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Chọn Học Sinh <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-bold text-slate-800"
          >
            <option value="">-- Chọn học sinh trong danh sách Lớp 5/4 --</option>
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                #{st.student_code} - {st.full_name} (Tổ {st.team_number})
              </option>
            ))}
          </select>
        </div>

        {/* Select Point Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Hình Thức Khen Thưởng / Đánh Giá
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pointOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = pointType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setPointType(opt.id as any);
                    if (!reason) setReason(opt.defaultReason);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center space-x-2.5 ${
                    isSelected
                      ? `${opt.color} ring-2 ring-sky-300 shadow-sm`
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="leading-tight">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Number of points */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số Lượng (Ví dụ: 1 bông hoa, 2 sao...)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tuần Thi Đua
            </label>
            <div className="px-3 py-2 text-sm rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-700">
              Tuần {currentWeek} (Học kỳ 1)
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Lý Do Khen Thưởng / Nhắc Nhở <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="VD: Được 10 điểm môn Toán, Giúp đỡ bạn cùng tiến..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-medium"
          />
        </div>

        {/* Modal Actions */}
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
            className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center space-x-1.5 shadow-md shadow-orange-500/25 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Đang ghi nhận...' : 'Xác Nhận Khen Thưởng'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
