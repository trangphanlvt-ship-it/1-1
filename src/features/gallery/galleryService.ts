import { supabase } from '../../lib/supabase';
import { ActivityAlbum, ActivityPhoto } from '../../types/database.types';

export const galleryService = {
  // Lấy danh sách albums
  async getAlbums(): Promise<ActivityAlbum[]> {
    const { data, error } = await supabase
      .from('activity_albums')
      .select(`
        *,
        photos:activity_photos(id)
      `)
      .order('event_date', { ascending: false });

    if (error) {
      console.warn('Lỗi tải albums:', error);
      return [];
    }

    return (data || []).map((a: any) => ({
      ...a,
      photos_count: a.photos?.length || 0,
    }));
  },

  // Tạo album mới
  async createAlbum(album: Partial<ActivityAlbum>): Promise<ActivityAlbum> {
    const { data, error } = await supabase
      .from('activity_albums')
      .insert({
        title: album.title,
        description: album.description,
        event_date: album.event_date || new Date().toISOString().split('T')[0],
        cover_image_url: album.cover_image_url,
        created_by: album.created_by,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Lấy danh sách ảnh của 1 album
  async getPhotos(albumId?: string): Promise<ActivityPhoto[]> {
    let query = supabase
      .from('activity_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (albumId && albumId !== 'all') {
      query = query.eq('album_id', albumId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Lỗi tải ảnh hoạt động:', error);
      return [];
    }
    return data || [];
  },

  // Tải ảnh trực tiếp lên Supabase Storage bucket 'activity-photos'
  async uploadPhotoFile(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `albums/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('activity-photos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Lỗi upload storage:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('activity-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Lưu thông tin ảnh vào database
  async savePhotoRecord(photo: Partial<ActivityPhoto>): Promise<ActivityPhoto> {
    const { data, error } = await supabase
      .from('activity_photos')
      .insert({
        album_id: photo.album_id,
        image_url: photo.image_url,
        caption: photo.caption,
        uploaded_by: photo.uploaded_by,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Xóa ảnh
  async deletePhoto(id: string): Promise<void> {
    const { error } = await supabase
      .from('activity_photos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
