import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar, NavTab } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { ClassOverview } from './features/home/ClassOverview';
import { StudentList } from './features/students/StudentList';
import { NoticeBoard } from './features/notices/NoticeBoard';
import { WeeklyLeaderboard } from './features/competition/WeeklyLeaderboard';
import { PhotoGallery } from './features/gallery/PhotoGallery';
import { AuthModal } from './features/auth/AuthModal';
import { ConfigModal } from './features/admin/ConfigModal';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navbar with header information */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'overview' && (
          <ClassOverview onSelectTab={setCurrentTab} />
        )}
        {currentTab === 'students' && (
          <StudentList onShowToast={showToast} />
        )}
        {currentTab === 'notices' && (
          <NoticeBoard onShowToast={showToast} />
        )}
        {currentTab === 'competition' && (
          <WeeklyLeaderboard onShowToast={showToast} />
        )}
        {currentTab === 'gallery' && (
          <PhotoGallery onShowToast={showToast} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={(msg) => showToast(msg, 'success')}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
