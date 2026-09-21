import React, { useState, useEffect } from 'react';
import { NavTab } from '../../components/common/Navbar';
import { studentService } from '../students/studentService';
import { noticeService } from '../notices/noticeService';
import { competitionService } from '../competition/competitionService';
import { galleryService } from '../gallery/galleryService';
import { Student, Notice, WeeklyCompetition, ActivityPhoto } from '../../types/database.types';
import { formatDateVN, getInitials } from '../../utils/formatters';
import { 
  Users, 
  BellRing, 
  Trophy, 
  Images, 
  Sparkles, 
  Award, 
  BookOpen, 
  ChevronRight, 
  Calendar, 
  Crown,
  Heart,
  Star
} from 'lucide-react';

interface ClassOverviewProps {
  onSelectTab: (tab: NavTab) => void;
}

export const ClassOverview: React.FC<ClassOverviewProps> = ({ onSelectTab }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [latestNotices, setLatestNotices] = useState<Notice[]>([]);
  const [topWeekly, setTopWeekly] = useState<WeeklyCompetition[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<ActivityPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [studs, nots, comps, phots] = await Promise.all([
          studentService.getStudents().catch(() => []),
          noticeService.getNotices().catch(() => []),
          competitionService.getWeeklyCompetitions(3).catch(() => []),
          galleryService.getPhotos().catch(() => [])
        ]);

        setStudents(studs);
        setLatestNotices(nots.slice(0, 3));
        setTopWeekly(comps.slice(0, 3).filter((c) => (c.total_score || 0) > 0));
        setRecentPhotos(phots.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    loadOverviewData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-700 to-cyan-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl shadow-sky-700/20">
        {/* Background glow graphics */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/15 text-xs font-bold backdrop-blur-md border border-white/20 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Cổng Thông Tin Học Tập Điện Tử</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Chào Mừng Đến Với <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              Tập Thể Lớp 5/4
            </span>
          </h1>

          <div className="mt-4 space-y-1.5 text-sky-100 text-sm sm:text-base font-medium">
            <p className="flex items-center space-x-2">
              <span className="font-bold text-white">Trường Tiểu học Lê Văn Tám</span>
              <span>•</span>
              <span>Năm học 2026 - 2027</span>
            </p>
            <p className="flex items-center space-x-2 text-amber-200 font-bold">
              <span>👩‍🏫 Giáo viên chủ nhiệm:</span>
              <span className="text-white underline decoration-amber-400 decoration-2 underline-offset-4">
                Cô PHAN THỊ DIỄM TRANG
              </span>
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectTab('notices')}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/25 transition-all hover:scale-[1.02] flex items-center space-x-2"
            >
              <BellRing className="w-4 h-4 text-slate-900" />
              <span>Xem Dặn Dò Hôm Nay</span>
            </button>
            <button
              onClick={() => onSelectTab('students')}
              className="px-5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/25 transition-all flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Danh Sách Học Sinh ({students.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Feature Shortcut Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Học sinh */}
        <div
          onClick={() => onSelectTab('students')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-400 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
              Hồ Sơ Học Sinh
            </h3>
            <span className="text-xs font-bold text-sky-600 font-mono">{students.length} em</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý lý lịch, liên lạc phụ huynh và xuất/nhập Excel danh sách lớp.
          </p>
          <div className="mt-3 text-xs font-bold text-sky-600 flex items-center space-x-1">
            <span>Truy cập</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 2. Dặn dò */}
        <div
          onClick={() => onSelectTab('notices')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BellRing className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
              Sổ Dặn Dò
            </h3>
            <span className="text-xs font-bold text-amber-600 font-mono">{latestNotices.length} mới</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi bài tập về nhà, thông báo môn học và dặn dò quan trọng từ GVCN.
          </p>
          <div className="mt-3 text-xs font-bold text-amber-600 flex items-center space-x-1">
            <span>Xem chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 3. Thi đua */}
        <div
          onClick={() => onSelectTab('competition')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-yellow-600 transition-colors">
              Thi Đua Tuần
            </h3>
            <span className="text-xs font-bold text-yellow-700">4 Tổ</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bảng vàng hoa điểm 10, ngôi sao chăm ngoan và xếp hạng cờ thi đua các tổ.
          </p>
          <div className="mt-3 text-xs font-bold text-yellow-700 flex items-center space-x-1">
            <span>Bảng vàng</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 4. Thư viện ảnh */}
        <div
          onClick={() => onSelectTab('gallery')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Images className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-teal-600 transition-colors">
              Góc Kỷ Niệm
            </h3>
            <span className="text-xs font-bold text-teal-600">{recentPhotos.length} ảnh</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kho lưu giữ hình ảnh học tập, trải nghiệm ngoại khóa và lễ hội của lớp.
          </p>
          <div className="mt-3 text-xs font-bold text-teal-600 flex items-center space-x-1">
            <span>Xem ảnh</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Latest Notices & Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Latest Notices Preview */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <BellRing className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Dặn Dò Mới Nhất Từ Cô Trang</h3>
            </div>
            <button
              onClick={() => onSelectTab('notices')}
              className="text-xs font-bold text-sky-600 hover:underline flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestNotices.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Chưa có bài dặn dò nào được đăng.</p>
          ) : (
            <div className="space-y-3">
              {latestNotices.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onSelectTab('notices')}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/30 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold">
                      {n.subject}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateVN(n.target_date)}</span>
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">{n.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Col 3: Honor Roll / Top Students */}
        <div className="bg-gradient-to-b from-amber-500/10 to-transparent rounded-3xl p-6 border border-amber-200/80 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                <Crown className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Bảng Vàng Tuần</h3>
            </div>
            <button
              onClick={() => onSelectTab('competition')}
              className="text-xs font-bold text-amber-800 hover:underline flex items-center space-x-1"
            >
              <span>Chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topWeekly.length === 0 ? (
            <div className="text-center py-6">
              <Star className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-500">Đang cập nhật kết quả thi đua tuần mới...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topWeekly.map((item, idx) => (
                <div
                  key={item.student_id}
                  className="p-3 bg-white rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center ${
                      idx === 0 ? 'bg-amber-400 text-amber-950 shadow' : idx === 1 ? 'bg-slate-200 text-slate-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{item.student?.full_name}</p>
                      <p className="text-[10px] text-slate-400">Tổ {item.student?.team_number}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                    {item.total_score} đ
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Educational slogan */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-200/50 text-[11px] text-amber-900 leading-relaxed font-medium">
            <p className="font-bold flex items-center space-x-1 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Phương châm rèn luyện Lớp 5/4:</span>
            </p>
            Mỗi ngày đến trường là một ngày vui. Đoàn kết giúp đỡ bạn bè cùng tiến bộ!
          </div>
        </div>
      </div>

      {/* Recent Activity Gallery Preview */}
      {recentPhotos.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                <Images className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Khoảnh Khắc Lớp Học Gần Đây</h3>
            </div>
            <button
              onClick={() => onSelectTab('gallery')}
              className="text-xs font-bold text-teal-600 hover:underline flex items-center space-x-1"
            >
              <span>Xem tất cả ảnh</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {recentPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => onSelectTab('gallery')}
                className="aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:scale-105 transition-transform"
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || 'Kỷ niệm lớp 5/4'}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
