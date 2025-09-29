import React from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle, X, Clock, Shield, Star, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { TRIAL_SIGNUP_URL } from '../config/urls';

export default function CoachingModePage() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Coaching Mode - Private Restaurant Inspections | PeakOps"
        description="Get instant AI feedback on restaurant operations with our private coaching mode. Videos deleted after processing. Perfect for training managers and improving standards without compliance pressure."
        keywords="restaurant coaching, private inspections, restaurant training, manager coaching, food safety training, restaurant operations training, coaching mode"
        url="https://getpeakops.com/coaching"
        type="website"
      />
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Better inspections start with <span className="text-teal-300">a quick video</span>, not surprise audits
            </h1>
            <p className="text-xl md:text-2xl text-teal-100 mb-8 leading-relaxed">
              Run quick, private AI-powered video checks in minutes. No inspectors. No travel. No stress.
            </p>
            <div className="mb-8">
              <a
                href={TRIAL_SIGNUP_URL}
                className="inline-block px-8 py-4 bg-teal-400 text-teal-900 rounded-lg hover:bg-teal-300 transition-colors font-semibold text-lg shadow-lg"
              >
                Start Free Trial
                <span className="text-sm block font-normal">No credit card required</span>
              </a>
            </div>
            <p className="text-teal-200 text-sm">
              ✅ 7 days unlimited • ✅ Complete privacy • ✅ Instant results
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Coaching Mode Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to proactive compliance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-10 h-10 text-teal-600" />
              </div>
              <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Record Walkthrough Video
              </h3>
              <p className="text-gray-600">
                Capture a 2-3 minute video walkthrough of your store using any smartphone. Focus on key areas like cleanliness, safety, and compliance.
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
                AI Reviews Instantly
              </h3>
              <p className="text-gray-600">
                Our AI analyzes your video in minutes, identifying compliance issues and opportunities for improvement with detailed timestamps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-orange-600" />
              </div>
              <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Private Scorecard Generated
              </h3>
              <p className="text-gray-600">
                Get your private scorecard with actionable recommendations. Video is permanently deleted after processing for complete privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Callout */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Are you tired of getting blindsided by inspection failures?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Unannounced visits</h3>
                <p className="text-gray-600 text-sm">Surprise inspections catch you off-guard with no time to prepare</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Critical issues missed</h3>
                <p className="text-gray-600 text-sm">Small problems become big failures during formal audits</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Morale drops</h3>
                <p className="text-gray-600 text-sm">Team stress increases when audits become adversarial</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Delayed feedback</h3>
                <p className="text-gray-600 text-sm">Wait weeks for inspection results when issues need immediate attention</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Always playing defense</h3>
                <p className="text-gray-600 text-sm">Reactive management instead of proactive improvement</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Inconsistent standards</h3>
                <p className="text-gray-600 text-sm">Different inspectors focus on different priorities</p>
              </div>
            </div>

            <div className="bg-teal-600 text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">
                There's a better way: Coaching Mode
              </h3>
              <p className="text-teal-100 text-lg">
                Get ahead of problems before they become failures. Build confidence, not stress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Managers Love It */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Managers Love Coaching Mode
            </h2>
            <p className="text-xl text-gray-600">
              Built for busy managers who want to stay ahead, not behind
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Private
              </h3>
              <p className="text-gray-600">
                Results stay at your store level. No corporate visibility during the coaching phase. Build confidence privately.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Fast
              </h3>
              <p className="text-gray-600">
                Get feedback in minutes, not weeks. Address issues immediately while they're still fresh and fixable.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Actionable
              </h3>
              <p className="text-gray-600">
                Detailed scorecards with specific tasks, timestamps, and priority levels. Know exactly what to fix first.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Lightweight
              </h3>
              <p className="text-gray-600">
                Just a quick video, a few minutes per run. No scheduling, no travel, no disruption to daily operations. Do it when convenient.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Coaching Report */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Example Coaching Report
            </h2>
            <p className="text-xl text-gray-600">
              See what your private coaching scorecard looks like
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold">Store Coaching Report</h3>
                    <p className="text-teal-100">Generated: March 15, 2024 at 2:30 PM</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">88%</div>
                    <div className="text-teal-100">Overall Score</div>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-gray-600">Uniforms</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">78%</div>
                    <div className="text-gray-600">Cleanliness</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <div className="text-gray-600">Safety</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Priority Action Items</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Clean drink station area</div>
                      <div className="text-sm text-gray-600">Timestamp: 1:23 - Visible spills and sticky surfaces detected</div>
                      <div className="text-sm text-yellow-700 mt-1">Medium Priority</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Straighten uniform name tags</div>
                      <div className="text-sm text-gray-600">Timestamp: 0:45 - Two team members have crooked/missing tags</div>
                      <div className="text-sm text-blue-700 mt-1">Low Priority</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Excellent safety compliance</div>
                      <div className="text-sm text-gray-600">All safety equipment visible and accessible</div>
                      <div className="text-sm text-green-700 mt-1">Keep up the great work!</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>This report stays at your location. The video is deleted after processing for complete privacy.</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Free Trial Details */}
      <section id="trial" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Free Trial Details
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-teal-50 p-8 rounded-2xl border border-teal-200">
                <div className="text-4xl font-bold text-teal-600 mb-4">7</div>
                <div className="font-semibold text-gray-900 mb-2">Days Unlimited</div>
                <p className="text-gray-600">Run as many coaching sessions as you want during your trial period</p>
              </div>

              <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200">
                <div className="text-4xl font-bold text-blue-600 mb-4">$0</div>
                <div className="font-semibold text-gray-900 mb-2">Cost, No Obligation</div>
                <p className="text-gray-600">No credit card required. No hidden fees. No automatic billing.</p>
              </div>

              <div className="bg-orange-50 p-8 rounded-2xl border border-orange-200">
                <div className="text-4xl font-bold text-orange-600 mb-4">📱</div>
                <div className="font-semibold text-gray-900 mb-2">Works on Any Smartphone</div>
                <p className="text-gray-600">Record a quick video on iOS or Android. No special equipment or apps to download.</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">Ready to start coaching?</h3>
              <p className="text-teal-100 mb-6">Join hundreds of managers who are already using PeakOps to stay ahead of compliance issues.</p>
              <a 
                href={TRIAL_SIGNUP_URL}
                className="inline-block px-8 py-4 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
              >
                Start Free Trial Now
              </a>
              <p className="text-teal-200 text-sm mt-4">
                Takes less than 2 minutes to get started
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Upgrade Teaser */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              When You're Ready for More
            </h2>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Upgrade to Enterprise Mode
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Official, auditable inspection records</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Corporate dashboards with regional trends</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Compliance reporting and heatmaps</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Integration with task management systems</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-100 p-6 rounded-lg">
                  <img
                    src="https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Corporate dashboard preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <p className="text-sm text-gray-600 mt-3 text-center">
                    Enterprise dashboard preview
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <Link
                  to="/enterprise"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Learn About Enterprise
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            "Coaching today. Confidence tomorrow."
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
            Stop getting surprised by inspection failures. Start building confidence with private, instant feedback that helps you improve every day.
          </p>
          <button className="px-8 py-4 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg">
            Try Coaching Mode Free
          </button>
          <p className="text-teal-200 text-sm mt-4">
            7 days unlimited • No credit card • Complete privacy
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}