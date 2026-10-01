import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HeritageMapPage from './pages/HeritageMapPage';
import HeritageDetailPage from './pages/HeritageDetailPage';
import AITranslationPage from './pages/AITranslationPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<HomePage />} />
        <Route path="/heritage-map"        element={<HeritageMapPage />} />
        <Route path="/heritage/:siteId"    element={<HeritageDetailPage />} />
        <Route path="/ai-translation"      element={<AITranslationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
