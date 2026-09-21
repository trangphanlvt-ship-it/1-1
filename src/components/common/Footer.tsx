import React from 'react';
import { Heart, School, Phone, Mail, Award, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800 text-sm">
          {/* Col 1: Class Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-base">
              <School className="w-5 h-5 text-sky-400" />
              <span>Lớp 5/4 • Năm học 2026 - 2027</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Trang thông tin và quản lý học tập điện tử chính thức của tập thể Lớp 5/4, Trường Tiểu học Lê Văn Tám. Nơi lưu giữ những kỷ niệm và chắp cánh ước mơ cho các em học sinh.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-sky-300 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Khẩu hiệu: Chăm ngoan - Đoàn kết - Sáng tạo</span>
            </div>
          </div>

          {/* Col 2: Teacher Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Giáo viên Chủ nhiệm</span>
            </h4>
            <div className="text-xs space-y-1.5 text-slate-400">
              <p className="text-slate-200 font-semibold text-sm">Cô PHAN THỊ DIỄM TRANG</p>
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Liên hệ hỗ trợ phụ huynh & học sinh</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Trường Tiểu học Lê Văn Tám</span>
              </p>
            </div>
          </div>

          {/* Col 3: Principles & Notice */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">Lưu ý Dành Cho Phụ Huynh</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Kiểm tra mục <strong className="text-slate-200">Dặn dò</strong> mỗi ngày để đồng hành cùng con.</li>
              <li>Theo dõi bảng <strong className="text-slate-200">Thi đua tuần</strong> để động viên kịp thời.</li>
              <li>Xem và tải ảnh hoạt động tại mục <strong className="text-slate-200">Kỷ niệm lớp</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 - 2027 Tập thể Lớp 5/4 - Trường Tiểu học Lê Văn Tám. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Đồng hành với tình yêu thương</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>dành cho học sinh</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
