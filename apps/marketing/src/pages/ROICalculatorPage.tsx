import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import ROICalculator from '@/components/ROICalculator';

export default function ROICalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">VerityInspect</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Get Demo
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Calculator */}
      <main className="py-8">
        <ROICalculator />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-4">
            Ready to start saving? Get a personalized demo of VerityInspect.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Schedule Demo
          </button>
        </div>
      </footer>
    </div>
  );
}