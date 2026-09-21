import React, { useState, useRef } from 'react';
import { Modal } from '../../components/common/Modal';
import { ActivityAlbum } from '../../types/database.types';
import { galleryService } from './galleryService';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, Image as ImageIcon, Plus, FolderPlus, CheckCircle2, AlertCircle } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  albums: ActivityAlbum[];
  selectedAlbumId: string;
  onUploaded: (msg: string) => void;
  onAlbumCreated: () => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  albums,
  selectedAlbumId,
  onUploaded,
  onAlbumCreated,
}) => {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'photo' | 'album'>('photo');

  // Upload photo states
  const [targetAlbumId, setTargetAlbumId] = useState(selectedAlbumId !== 'all' ? selectedAlbumId : albums[0]?.id || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  
  // Create album states
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumDate, setNewAlbumDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Vui lòng chọn 1 bức ảnh để tải lên');
      return;
    }
    if (!targetAlbumId) {
      setError('Vui lòng chọn hoặc tạo album để chứa ảnh');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Upload to Supabase Storage
      const publicUrl = await galleryService.uploadPhotoFile(selectedFile);
      
      // 2. Save record to DB
      await galleryService.savePhotoRecord({
        album_id: targetAlbumId,
        image_url: publicUrl,
        caption: caption.trim() || undefined,
        uploaded_by: profile?.id,
      });

      onUploaded('Đã tải ảnh lên kỷ niệm lớp 5/4 thành công!');
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải ảnh lên. Hãy đảm bảo bucket activity-photos đã được tạo trên Supabase!');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) {
      setError('Vui lòng nhập tên Album');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await galleryService.createAlbum({
        title: newAlbumTitle.trim(),
        description: newAlbumDesc.trim() || undefined,
        event_date: newAlbumDate,
        created_by: profile?.id,
      });

      onUploaded(`Đã tạo album "${created.title}" thành công!`);
      setNewAlbumTitle('');
      setNewAlbumDesc('');
      onAlbumCreated();
      setTargetAlbumId(created.id);
      setTab('photo');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tạo album mới!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tải Ảnh Kỷ Niệm Hoạt Động Lớp 5/4"
      subtitle="Lưu giữ những khoảnh khắc đáng nhớ của cô trò và các bạn học sinh"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Tab switch: Upload Photo vs Create Album */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => { setTab('photo'); setError(null); }}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              tab === 'photo'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Tải Ảnh Mới</span>
          </button>
          <button
            onClick={() => { setTab('album'); setError(null); }}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              tab === 'album'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Tạo Album Sự Kiện Mới</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {tab === 'photo' ? (
          <form onSubmit={handleUploadPhoto} className="space-y-4">
            {/* Choose Album */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Chọn Album Hoạt Động <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setTab('album')}
                  className="text-xs text-sky-600 font-bold hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tạo Album mới</span>
                </button>
              </div>

              <select
                required
                value={targetAlbumId}
                onChange={(e) => setTargetAlbumId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="">-- Chọn một Album --</option>
                {albums.map((al) => (
                  <option key={al.id} value={al.id}>
                    📁 {al.title} ({al.photos_count || 0} ảnh)
                  </option>
                ))}
              </select>
            </div>

            {/* Photo Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bức Ảnh Cần Tải Lên <span className="text-rose-500">*</span>
              </label>

              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-56 flex items-center justify-center bg-slate-900">
                  <img src={previewUrl} alt="Preview" className="max-h-56 w-auto object-contain" />
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs font-bold backdrop-blur-sm"
                  >
                    Đổi ảnh khác
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Nhấp vào đây để chọn ảnh từ máy tính / điện thoại</p>
                    <p className="text-[11px] text-slate-400">JPG, PNG, WebP (Tối đa 15MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chú Thích / Lời Bình Cho Bức Ảnh
              </label>
              <input
                type="text"
                placeholder="VD: Các bạn Tổ 1 hào hứng tham gia ngày hội STEM..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-1.5 shadow-md shadow-sky-500/25 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Đang tải lên Supabase...' : 'Lưu Bức Ảnh'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* CREATE ALBUM TAB */
          <form onSubmit={handleCreateAlbum} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Album Sự Kiện <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Lễ Khai Giảng Năm Học 2026-2027, Tết Trung Thu..."
                value={newAlbumTitle}
                onChange={(e) => setNewAlbumTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày Diễn Ra Sự Kiện
              </label>
              <input
                type="date"
                required
                value={newAlbumDate}
                onChange={(e) => setNewAlbumDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mô Tả Về Hoạt Động Này
              </label>
              <textarea
                rows={3}
                placeholder="VD: Hoạt động chào đón năm học mới của các em học sinh lớp 5/4 với nhiều tiết mục văn nghệ đặc sắc..."
                value={newAlbumDesc}
                onChange={(e) => setNewAlbumDesc(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTab('photo')}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Quay Lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5 shadow-md shadow-emerald-600/25 disabled:opacity-50"
              >
                <FolderPlus className="w-4 h-4" />
                <span>{loading ? 'Đang tạo...' : 'Tạo Album Này'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
