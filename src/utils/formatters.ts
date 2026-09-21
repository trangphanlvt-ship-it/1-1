/**
 * Định dạng ngày theo chuẩn Việt Nam (DD/MM/YYYY)
 */
export const formatDateVN = (dateString?: string | null): string => {
  if (!dateString) return 'Chưa cập nhật';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Định dạng ngày giờ chi tiết (HH:mm - DD/MM/YYYY)
 */
export const formatDateTimeVN = (dateString?: string | null): string => {
  if (!dateString) return 'Chưa cập nhật';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Lấy chữ cái đầu của tên để làm Avatar dự phòng
 */
export const getInitials = (fullName?: string): string => {
  if (!fullName) return 'HS';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Màu sắc đại diện cho từng Tổ trong lớp 5/4
 */
export const getTeamBadgeColor = (teamNumber: number): { bg: string; text: string; border: string } => {
  switch (teamNumber) {
    case 1:
      return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 2:
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 3:
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 4:
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
};
