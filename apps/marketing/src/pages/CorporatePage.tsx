import { Link } from 'react-router-dom';
import { Shield, Eye, TrendingUp, CheckCircle, ArrowRight, BarChart3, Users, Building, DollarSign, Lock, Code, Phone } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ROICalculatorWidget from '../components/ROICalculatorWidget';

export default function CorporatePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI powered inspections at scale:
              <span className="text-blue-600"> Coaching + Compliance in one platform</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Transform your inspection process with dual mode technology. Start with manager coaching, scale to full compliance tracking with enterprise dashboards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/demo"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 inline-flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Get Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/coaching-mode"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Try Coaching Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Modes Explained */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Two Modes, Maximum Flexibility</h2>
            <p className="text-xl text-gray-600">Start with coaching adoption, scale to full compliance tracking</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coaching Mode */}
            <div className="bg-green-50 rounded-xl p-8 border-2 border-green-100">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 rounded-full p-4 mr-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold">Coaching Mode</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Private, fast, store level adoption. Perfect for building habits and manager confidence before rolling out official inspections.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Videos automatically deleted after processing</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Results stay at store level only</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Immediate actionable feedback</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Builds inspection readiness</span>
                </li>
              </ul>
            </div>

            {/* Inspection Mode */}
            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 rounded-full p-4 mr-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold">Inspection Mode</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Official records with full compliance tracking. Creates auditable documentation with corporate visibility and trend analysis.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Configurable video retention policies</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Official compliance documentation</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Corporate dashboards and reporting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Multi level review process</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Brands */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Transform Your Inspection Economics</h2>
            <p className="text-xl text-gray-600">Measurable impact on costs, coverage, and compliance quality</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">50-70%</div>
              <div className="text-sm text-gray-600 font-medium">Lower Travel Costs</div>
              <div className="text-xs text-gray-500 mt-1">Typical $500-$1000 per visit savings</div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">3-5x</div>
              <div className="text-sm text-gray-600 font-medium">Higher Coverage</div>
              <div className="text-xs text-gray-500 mt-1">More inspections per inspector</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-sm text-gray-600 font-medium">Objective Scoring</div>
              <div className="text-xs text-gray-500 mt-1">Eliminate inspector bias</div>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">Region</div>
              <div className="text-sm text-gray-600 font-medium">Wide Dashboards</div>
              <div className="text-xs text-gray-500 mt-1">Trends, heatmaps, insights</div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Embed */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Calculate Your Travel Savings</h2>
            <p className="text-xl text-gray-600">See the immediate impact on your inspection budget</p>
          </div>
          <ROICalculatorWidget />
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise Security & Privacy</h2>
            <p className="text-xl text-gray-600">Configurable data policies that scale with your compliance needs</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-center mb-6">
                <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Data Control</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Configurable retention periods
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Role based access controls
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Data residency options
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Audit trail logging
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-center mb-6">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Privacy First</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Coaching mode auto deletion
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Store level privacy controls
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  GDPR/CCPA compliance
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  End to end encryption
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-center mb-6">
                <Building className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Enterprise Ready</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  SSO integration
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  API access for data export
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Multi tenant architecture
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  24/7 enterprise support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Integration & API */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Seamless Integration</h2>
            <p className="text-xl text-gray-600">Connect with your existing task management and reporting systems</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mb-6 flex items-center justify-center">
                <Code className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">API & Webhooks</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>RESTful API for inspection data and results</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Real time webhooks for task management systems</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Automated report generation and delivery</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Custom dashboard embedding</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mb-6 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Data Feeds</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Integration with BI platforms (Tableau, Power BI)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Data warehouse exports for analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Scheduled CSV/JSON data exports</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Custom reporting dashboards</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study / Pilot Invite */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Partner With Us to Prove Proactive Inspections
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join leading restaurant brands in piloting the future of inspections. Start with a small store sample to validate ROI before full deployment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">30</div>
                <p className="text-gray-600">Day pilot program</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">5-10</div>
                <p className="text-gray-600">Stores to start</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">ROI</div>
                <p className="text-gray-600">Guaranteed measurement</p>
              </div>
            </div>
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 text-left max-w-2xl mx-auto">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-blue-800 text-sm">
                  <strong>Perfect for:</strong> Operations directors, brand executives, and franchise corporate teams ready to test the future of inspections.
                </p>
              </div>
            </div>
            <Link
              to="/demo"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              Schedule Pilot Discussion
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Inspection Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            See how leading brands are cutting travel costs while improving compliance coverage and consistency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demo"
              className="bg-white text-blue-600 px-10 py-4 rounded-lg text-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Get Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/coaching-mode"
              className="border-2 border-white text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Start with Coaching Mode
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}