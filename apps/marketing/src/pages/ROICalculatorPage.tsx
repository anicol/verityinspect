import { Link } from 'react-router-dom';
import ROICalculator from '@/components/ROICalculator';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ROICalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Calculator */}
      <main className="py-8">
        <ROICalculator />
      </main>

      {/* CTA Section */}
      <section className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Saving?
          </h2>
          <p className="text-gray-600 mb-6">
            Get a personalized demo to see how VerityInspect can transform your inspection process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demo"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Enterprise Demo
            </Link>
            <Link
              to="/coaching-mode"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Coaching Mode Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}