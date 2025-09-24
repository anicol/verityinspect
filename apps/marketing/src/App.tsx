import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import ROICalculatorPage from './pages/ROICalculatorPage';
import CoachingModePage from './pages/CoachingModePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/roi-calculator" element={<ROICalculatorPage />} />
      <Route path="/coaching-mode" element={<CoachingModePage />} />
    </Routes>
  );
}

export default App;