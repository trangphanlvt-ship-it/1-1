import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Database, CheckCircle, Key, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from '../../lib/supabase';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (message: string) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSave }) => {
  const [url, setUrl] = useState(localStorage.getItem('CUSTOM_SUPABASE_URL') || supabaseUrl || '');
  const [key, setKey] = useState(localStorage.getItem('CUSTOM_SUPABASE_ANON_KEY') || supabaseAnonKey || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && key.trim()) {
      localStorage.setItem('CUSTOM_SUPABASE_URL', url.trim());
      localStorage.setItem('CUSTOM_SUPABASE_ANON_KEY', key.trim());
      onSave('Đã lưu cấu hình Supabase! Đang tải lại kết nối...');
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('CUSTOM_SUPABASE_URL');
    localStorage.removeItem('CUSTOM_SUPABASE_ANON_KEY');
    setUrl('');
    setKey('');
    onSave('Đã xóa cấu hình tuỳ chỉnh!');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu Hình Kết Nối Cơ Sở Dữ Liệu Supabase"
      subtitle="Nhập Project URL và Anon API Key từ Supabase Dashboard để kích hoạt lưu trữ thực tế"
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 space-y-1">
          <div className="font-bold flex items-center space-x-1">
            <Database className="w-4 h-4 text-sky-600" />
            <span>Trạng thái kết nối hiện tại: {isSupabaseConfigured() ? '✅ Đã kết nối' : '⚠️ Chưa cấu hình'}</span>
          </div>
          <p className="text-slate-600">
            Bạn có thể tạo Project miễn phí tại <strong>supabase.com</strong>, chạy file <strong>supabase_schema.sql</strong> và dán 2 giá trị dưới đây vào:
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Supabase Project URL
          </label>
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="url"
              required
              placeholder="https://xyzabcdefg.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Supabase Anon Public API Key
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <textarea
              required
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono resize-none"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Lưu & Tải Lại Kết Nối</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center justify-center space-x-1"
            title="Khôi phục mặc định"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </Modal>
  );
};
