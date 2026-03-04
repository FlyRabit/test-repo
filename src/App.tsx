import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/useStore';
import { AuthProvider } from './store/authStore';
import Layout from './components/Layout';
import EditorPage from './pages/EditorPage';
import ImageLayoutPage from './pages/ImageLayoutPage';
import PublishPage from './pages/PublishPage';
import VideoPublishPage from './pages/VideoPublishPage';
import AIVideoPage from './pages/AIVideoPage';
import DashboardPage from './pages/DashboardPage';
import AIGeneratorPage from './pages/AIGeneratorPage';
import AccountPage from './pages/AccountPage';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<EditorPage />} />
              <Route path="images" element={<ImageLayoutPage />} />
              <Route path="publish" element={<PublishPage />} />
              <Route path="video" element={<VideoPublishPage />} />
              <Route path="ai" element={<AIGeneratorPage />} />
              <Route path="ai-video" element={<AIVideoPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="account" element={<AccountPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </StoreProvider>
  );
}
