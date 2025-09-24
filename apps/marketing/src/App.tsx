import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import ROICalculatorPage from './pages/ROICalculatorPage';
import CoachingModePage from './pages/CoachingModePage';
import CorporatePage from './pages/CorporatePage';
import DemoPage from './pages/DemoPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/roi-calculator" element={<ROICalculatorPage />} />
        <Route path="/coaching-mode" element={<CoachingModePage />} />
        <Route path="/enterprise" element={<CorporatePage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        {/* Placeholder routes for future pages */}
        <Route path="/terms" element={<div>Terms page coming soon</div>} />
      </Routes>
    </>
  );
}

export default App;