import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/useStore';
import Layout from './components/Layout';
import EditorPage from './pages/EditorPage';
import ImageLayoutPage from './pages/ImageLayoutPage';
import PublishPage from './pages/PublishPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<EditorPage />} />
            <Route path="images" element={<ImageLayoutPage />} />
            <Route path="publish" element={<PublishPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
