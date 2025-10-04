import React from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle, Shield, TrendingUp, Clock, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ROICalculator from '../components/ROICalculator';
import SEO from '../components/SEO';
import { TRIAL_SIGNUP_URL } from '../config/urls';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SEO
        title="PeakOps - AI-Powered Restaurant Video Inspections | Replace Site Visits with Coaching"
        description="Transform restaurant inspections with AI-powered video analysis. Cut travel costs by 50-70%, improve compliance, and turn inspections into coaching moments. Start your free trial today."
        keywords="restaurant inspections, AI video analysis, QSR inspections, restaurant compliance, food safety technology, restaurant management software, video inspections, coaching mode"
        url="https://getpeakops.com"
        type="website"
      />
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Continuous improvement for every location.
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              PeakOps helps managers and teams get better every day with quick AI video walkthroughs and daily micro-checks — building consistency, confidence, and cleaner operations across every store.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={TRIAL_SIGNUP_URL}
                className="px-8 py-4 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors font-semibold text-lg shadow-lg"
              >
                Start Free Trial →
              </a>
              <Link
                to="/demo"
                className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
              >
                Get Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Modes Split */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Two Ways to Improve — One Seamless Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the approach that fits your needs, or use both together for comprehensive coverage.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Coaching Mode */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Walkthroughs (Coaching Mode)
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Quick, private AI video feedback that helps you spot issues early and train your team faster.
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Instant AI feedback in minutes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Private & deleted after processing</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Confidence before every audit</span>
                </li>
              </ul>
              <Link
                to="/coaching-mode"
                className="block w-full text-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Learn More
              </Link>
            </div>

            {/* Enterprise Mode */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Inspections (Enterprise Mode)
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Centralized video reviews, official reports, and dashboards for consistent quality across every store.
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">50–70% reduction in travel and inspection costs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Official compliance tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Enterprise dashboards & insights</span>
                </li>
              </ul>
              <Link
                to="/enterprise"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Micro-Checks */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Micro-Checks: Small Habits, Big Improvements
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              PeakOps sends 3 randomized items daily or every few days — quick checks your team can do in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reinforces daily standards
              </h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Builds accountability and team ownership
              </h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Prevents small issues from becoming big problems
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple workflows that build better operations every day
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-10 h-10 text-orange-600" />
              </div>
              <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Record & Check
              </h3>
              <p className="text-gray-600">
                Record a short walkthrough video or complete a micro-check using your smartphone.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-blue-600" />
              </div>
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI Analyzes in Minutes
              </h3>
              <p className="text-gray-600">
                AI analyzes in minutes, spotting issues and highlighting what's working well.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-teal-600" />
              </div>
              <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Review Your Fix List
              </h3>
              <p className="text-gray-600">
                Review your Fix List — make improvements and track your store's progress over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                The Value of Continuous Improvement
              </h2>
              
              {/* For Managers */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-teal-600 mb-4">
                  Managers
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Less stress from surprise audits</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Daily confidence through quick checks</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Build stronger, more consistent teams</span>
                  </li>
                </ul>
              </div>

              {/* For Brands */}
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-4">
                  Brands & Franchise Owners
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Consistent standards across every store</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">50–70% reduction in travel and inspection costs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Continuous visibility and faster improvements</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <img
                src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Manager conducting inspection"
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  "We caught issues before our corporate audit and saved our store from a failing grade."
                </h4>
                <p className="text-gray-600">— Store Manager, QSR Chain</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Calculate Your ROI
            </h2>
            <p className="text-xl text-gray-600">
              See how much you could save with PeakOps
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <ROICalculator isPreview={true} />
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Security & Privacy — Built for Trust
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Coaching Mode
              </h3>
              <p className="text-gray-600">
                <strong>Private and deleted after analysis.</strong> Results stay with your store.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Enterprise Mode
              </h3>
              <p className="text-gray-600">
                <strong>Encrypted, retained, and available for corporate reporting.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build a Culture of Continuous Improvement?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Start with AI coaching today — add daily micro-checks and enterprise visibility as you grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={TRIAL_SIGNUP_URL}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
            >
              Try Coaching Free
            </a>
            <Link
              to="/demo"
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
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