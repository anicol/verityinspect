import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import VideosPage from '@/pages/VideosPage';
import VideoUploadPage from '@/pages/VideoUploadPage';
import VideoDetailPage from '@/pages/VideoDetailPage';
import InspectionsPage from '@/pages/InspectionsPage';
import InspectionDetailPage from '@/pages/InspectionDetailPage';
import ActionItemsPage from '@/pages/ActionItemsPage';
import BrandsPage from '@/pages/BrandsPage';
import StoresPage from '@/pages/StoresPage';
import UsersPage from '@/pages/UsersPage';
import MobileCapturePage from '@/pages/MobileCapturePage';
import InspectorQueuePage from '@/pages/InspectorQueuePage';
import { MobileCaptureProvider } from '@/pages/MobileCaptureContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return (
      <MobileCaptureProvider>
        <Routes>
          {/* Mobile capture route - full screen without layout */}
          <Route path="/capture" element={<MobileCapturePage />} />
          
          {/* Regular routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/videos/upload" element={<VideoUploadPage />} />
                <Route path="/videos/:id" element={<VideoDetailPage />} />
                <Route path="/inspections" element={<InspectionsPage />} />
                <Route path="/inspections/:id" element={<InspectionDetailPage />} />
                <Route path="/actions" element={<ActionItemsPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/stores" element={<StoresPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/inspector-queue" element={<InspectorQueuePage />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </MobileCaptureProvider>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;