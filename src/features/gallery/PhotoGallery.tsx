import React, { useState, useEffect } from 'react';
import { ActivityAlbum, ActivityPhoto } from '../../types/database.types';
import { galleryService } from './galleryService';
import { useAuth } from '../../context/AuthContext';
import { PhotoUploadModal } from './PhotoUploadModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateVN } from '../../utils/formatters';
import { 
  Images, 
  UploadCloud, 
  FolderPlus, 
  Calendar, 
  Maximize2, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Download
} from 'lucide-react';

interface PhotoGalleryProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onShowToast }) => {
  const { role } = useAuth();
  const canEdit = role === 'teacher' || role === 'admin';

  const [albums, setAlbums] = useState<ActivityAlbum[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [photos, setPhotos] = useState<ActivityPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const [albumData, photoData] = await Promise.all([
        galleryService.getAlbums(),
        galleryService.getPhotos(selectedAlbumId)
      ]);
      setAlbums(albumData);
      setPhotos(photoData);
    } catch (err: any) {
      console.error(err);
      onShowToast('Lỗi khi tải thư viện ảnh kỷ niệm!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [selectedAlbumId]);

  const handleDeletePhoto = async (photo: ActivityPhoto, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi album?')) return;
    try {
      await galleryService.deletePhoto(photo.id);
      onShowToast('Đã xóa bức ảnh!', 'success');
      fetchGallery();
      if (lightboxIndex !== null) setLightboxIndex(null);
    } catch (err: any) {
      console.error(err);
      onShowToast('Lỗi khi xóa ảnh!', 'error');
    }
  };

  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-600/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-2">
            <Images className="w-3.5 h-3.5 text-teal-200" />
            <span>Kho Ảnh Kỷ Niệm Lớp Học</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Khoảnh Khắc Đáng Nhớ Lớp 5/4
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
            Lưu giữ hình ảnh các buổi sinh hoạt, lễ hội, hội thi và hoạt động trải nghiệm thực tế trong năm học 2026 - 2027.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white text-teal-900 text-xs font-black hover:bg-teal-50 transition-all shadow-md self-start md:self-auto"
          >
            <UploadCloud className="w-4 h-4 text-teal-600" />
            <span>Tải Ảnh / Tạo Album</span>
          </button>
        )}
      </div>

      {/* Albums Filter Navigation */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center space-x-2 overflow-x-auto">
        <button
          onClick={() => setSelectedAlbumId('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center space-x-1.5 ${
            selectedAlbumId === 'all'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>🌟 Tất cả ảnh ({photos.length})</span>
        </button>

        {albums.map((album) => {
          const isSelected = selectedAlbumId === album.id;
          return (
            <button
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📁 {album.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {album.photos_count || 0}
              </span>
            </button>
          );
        })}

        {canEdit && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all flex-shrink-0 flex items-center space-x-1"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Thêm Album</span>
          </button>
        )}
      </div>

      {/* Album Info if specific album selected */}
      {selectedAlbum && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{selectedAlbum.title}</h3>
            {selectedAlbum.description && <p className="text-slate-500 mt-0.5">{selectedAlbum.description}</p>}
          </div>
          <div className="flex items-center space-x-1 text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ngày sự kiện: {formatDateVN(selectedAlbum.event_date)}</span>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {loading ? (
        <LoadingSpinner message="Đang nạp thư viện ảnh kỷ niệm..." />
      ) : photos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
            <Images className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có bức ảnh nào trong album này</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {canEdit
              ? 'Nhấn nút "Tải Ảnh / Tạo Album" để tải lên những khoảnh khắc đầu tiên của lớp 5/4!'
              : 'Hình ảnh hoạt động sẽ được GVCN cập nhật sớm.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative bg-slate-900 rounded-2xl overflow-hidden aspect-square cursor-pointer shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={photo.image_url}
                alt={photo.caption || 'Ảnh hoạt động lớp 5/4'}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white">
                <div className="flex justify-end space-x-1">
                  {canEdit && (
                    <button
                      onClick={(e) => handleDeletePhoto(photo, e)}
                      className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold line-clamp-2 drop-shadow-sm">
                    {photo.caption || 'Kỷ niệm lớp 5/4'}
                  </p>
                  <span className="text-[10px] text-teal-200 mt-1 flex items-center space-x-1">
                    <Maximize2 className="w-3 h-3 inline" />
                    <span>Xem phóng to</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Fullscreen Modal */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
              <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                {lightboxIndex + 1} / {photos.length}
              </span>
              <div className="flex items-center space-x-2">
                <a
                  href={photos[lightboxIndex].image_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Tải ảnh gốc về máy"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Đóng xem ảnh"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Lightbox Image */}
            <div className="max-h-[80vh] max-w-full flex items-center justify-center">
              <img
                src={photos[lightboxIndex].image_url}
                alt={photos[lightboxIndex].caption || 'Ảnh phóng to'}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {/* Caption */}
            {photos[lightboxIndex].caption && (
              <div className="mt-3 text-center text-white text-xs sm:text-sm font-medium bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm max-w-xl">
                {photos[lightboxIndex].caption}
              </div>
            )}

            {/* Navigation buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : photos.length - 1))}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev! < photos.length - 1 ? prev! + 1 : 0))}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload & Create Album Modal */}
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        albums={albums}
        selectedAlbumId={selectedAlbumId}
        onUploaded={(msg) => {
          onShowToast(msg, 'success');
          fetchGallery();
        }}
        onAlbumCreated={() => {
          galleryService.getAlbums().then(setAlbums);
        }}
      />
    </div>
  );
};
