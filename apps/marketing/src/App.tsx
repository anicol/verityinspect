import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import ROICalculatorPage from './pages/ROICalculatorPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/roi-calculator" element={<ROICalculatorPage />} />
    </Routes>
  );
}

export default App;