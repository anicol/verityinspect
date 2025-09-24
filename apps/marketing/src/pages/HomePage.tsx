import { Link } from 'react-router-dom';
import { Shield, Eye, TrendingUp, CheckCircle, ArrowRight, Users, Smartphone, Clock, BarChart3 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ROICalculatorWidget from '../components/ROICalculatorWidget';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI powered inspections that 
              <span className="text-blue-600"> start with coaching</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Empower managers with private, fast feedback and give brands scalable, consistent compliance when they need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/coaching-mode"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 inline-flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <Link
                to="/demo"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Get Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Audiences / Two Modes */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Path</h2>
            <p className="text-xl text-gray-600">Different needs, same powerful AI technology</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Managers */}
            <div className="bg-green-50 rounded-xl p-8 border-2 border-green-100 hover:border-green-200 transition-colors">
              <div className="text-center mb-6">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">For Managers</h3>
                <div className="text-green-700 font-medium text-lg mb-2">Coaching Mode</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Quick, private AI feedback</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Videos deleted after processing</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>7 day free trial available</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>No surprise audits</span>
                </li>
              </ul>
              <Link
                to="/coaching-mode"
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center font-semibold"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* For Brands */}
            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-100 hover:border-blue-200 transition-colors">
              <div className="text-center mb-6">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">For Brands</h3>
                <div className="text-blue-700 font-medium text-lg mb-2">Enterprise Mode</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  <span>50 to 70% travel savings</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Official compliance records</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Corporate dashboards</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Trend analysis</span>
                </li>
              </ul>
              <Link
                to="/demo"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center font-semibold"
              >
                Get Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Simple 3 step process for both coaching and inspection modes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Record</h3>
              <p className="text-gray-600">
                Use your phone to capture a 2 to 3 minute video walkthrough with guided prompts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">AI Reviews</h3>
              <p className="text-gray-600">
                Our system instantly analyzes safety, cleanliness, uniforms, and signage standards.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Scorecard</h3>
              <p className="text-gray-600">
                Get instant results with clear action items. Private for coaching, official for compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The Value for Everyone
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Managers */}
            <div className="text-center lg:text-left">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto lg:mx-0 mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">For Managers</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span><strong>Less stress:</strong> Know issues before inspectors arrive</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span><strong>Faster fixes:</strong> Get specific action items in minutes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span><strong>No surprise audits:</strong> Stay ahead with regular coaching</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span><strong>Build confidence:</strong> Improve standards continuously</span>
                </li>
              </ul>
            </div>

            {/* For Brands */}
            <div className="text-center lg:text-left">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto lg:mx-0 mb-6 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">For Brands</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span><strong>Consistent standards:</strong> Objective AI scoring eliminates bias</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span><strong>Lower costs:</strong> Reduce travel expenses by 50 to 70%</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span><strong>Scalable coverage:</strong> Inspect 3 to 5x more locations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span><strong>Data insights:</strong> Regional trends and issue tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ROICalculatorWidget />
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Security & Privacy Built In
            </h2>
            <p className="text-xl text-gray-600">Trust and transparency for both coaching and compliance needs</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Shield className="h-6 w-6 text-green-600 mr-3" />
                Coaching Mode Privacy
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Videos automatically deleted after processing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Results stay at store level only
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  No corporate visibility or tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Manager controls all data
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-3" />
                Inspection Mode Records
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                  Configurable retention policies
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                  Official compliance documentation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                  Corporate dashboards and reporting
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                  Audit trail and data export
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose your path: Start with free coaching or explore enterprise solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/coaching-mode"
              className="bg-green-600 text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              Try Coaching Free
            </Link>
            <Link
              to="/demo"
              className="bg-blue-600 text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              Schedule Enterprise Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}