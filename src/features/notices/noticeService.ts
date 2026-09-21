import { supabase } from '../../lib/supabase';
import { Notice } from '../../types/database.types';

export const noticeService = {
  // Lấy danh sách dặn dò và thông báo
  async getNotices(userId?: string): Promise<Notice[]> {
    const { data, error } = await supabase
      .from('notices')
      .select(`
        *,
        notice_confirmations(id, confirmed_by)
      `)
      .order('is_important', { ascending: false })
      .order('target_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi tải dặn dò:', error);
      throw error;
    }

    return (data || []).map((n: any) => ({
      ...n,
      confirmations_count: n.notice_confirmations?.length || 0,
      is_confirmed_by_me: userId ? n.notice_confirmations?.some((c: any) => c.confirmed_by === userId) : false,
    }));
  },

  // Tạo dặn dò mới
  async createNotice(notice: Partial<Notice>): Promise<Notice> {
    const { data, error } = await supabase
      .from('notices')
      .insert({
        title: notice.title,
        content: notice.content,
        subject: notice.subject || 'Chung',
        target_date: notice.target_date || new Date().toISOString().split('T')[0],
        is_important: notice.is_important || false,
        author_name: notice.author_name || 'Cô Phan Thị Diễm Trang',
        author_id: notice.author_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Lỗi tạo dặn dò:', error);
      throw error;
    }
    return data;
  },

  // Cập nhật dặn dò
  async updateNotice(id: string, notice: Partial<Notice>): Promise<Notice> {
    const { data, error } = await supabase
      .from('notices')
      .update({
        ...notice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Lỗi sửa dặn dò:', error);
      throw error;
    }
    return data;
  },

  // Xóa dặn dò
  async deleteNotice(id: string): Promise<void> {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Lỗi xóa dặn dò:', error);
      throw error;
    }
  },

  // Học sinh / Phụ huynh xác nhận đã đọc hoặc hoàn thành dặn dò
  async confirmNotice(noticeId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('notice_confirmations')
      .upsert({
        notice_id: noticeId,
        confirmed_by: profileId,
      });

    if (error) {
      console.error('Lỗi xác nhận dặn dò:', error);
      throw error;
    }
  },

  // Hủy xác nhận
  async unconfirmNotice(noticeId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('notice_confirmations')
      .delete()
      .match({
        notice_id: noticeId,
        confirmed_by: profileId,
      });

    if (error) {
      console.error('Lỗi hủy xác nhận dặn dò:', error);
      throw error;
    }
  }
};
