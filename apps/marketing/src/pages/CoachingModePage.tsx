import { Link } from 'react-router-dom';
import { Shield, Play, CheckCircle, ArrowRight, Smartphone, Clock, Eye, Star, Users, TrendingUp, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CoachingModePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Better inspections start with coaching, 
              <span className="text-blue-600">not surprise audits.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Run quick, private AI-powered store checks in minutes. No inspectors. No travel. No stress.
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  2 minute videos
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Instant results
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  100% private
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 inline-flex items-center justify-center shadow-lg hover:shadow-xl">
                <ArrowRight className="mr-2 h-5 w-5" />
                Start Free Trial
                <span className="ml-2 text-sm opacity-90">(no credit card required)</span>
              </button>
            </div>
            
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works (3 Steps)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Record a quick walkthrough</h3>
              <p className="text-gray-600">
                Use your phone to capture a short 2 to 3 minute video (guided prompts included).
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">AI reviews instantly</h3>
              <p className="text-gray-600">
                Our system checks brand basics like safety, cleanliness, uniforms, and signage, then highlights what needs fixing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Get your private scorecard</h3>
              <p className="text-gray-600">
                You see the results, with clear tasks to act on. Videos are deleted after processing so nothing goes to corporate.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Pain Point Section */}
      <section className="py-16 bg-red-50 border-l-4 border-red-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-900 mb-6">
              Are you tired of getting blindsided by inspection failures?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-red-800 max-w-4xl mx-auto items-start">
              <div className="text-left">
                <p className="mb-2 flex items-center justify-start">❌ District manager shows up unannounced</p>
                <p className="mb-2 flex items-center justify-start">❌ Critical issues you never saw coming</p>
                <p className="mb-2 flex items-center justify-start">❌ Team morale drops after surprise audits</p>
              </div>
              <div className="text-left">
                <p className="mb-2 flex items-center justify-start">❌ Weeks between feedback and actual problems</p>
                <p className="mb-2 flex items-center justify-start">❌ Playing defense instead of staying ahead</p>
                <p className="mb-2 flex items-center justify-start">❌ Feeling like you're always behind</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Managers Love Coaching Mode */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Managers Love Coaching Mode
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold mb-2">Private</h3>
                  <p className="text-gray-600">Results stay at your store.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold mb-2">Fast</h3>
                  <p className="text-gray-600">Feedback in minutes, not months.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold mb-2">Actionable</h3>
                  <p className="text-gray-600">Scorecards come with a to do list you can act on today.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold mb-2">Lightweight</h3>
                  <p className="text-gray-600">Just a few minutes per run with no inspectors, no scheduling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Coaching Report */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See What You Get</h2>
            <p className="text-xl text-gray-600">Quick, actionable feedback with specific tasks to improve</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <h3 className="text-2xl font-semibold mb-2">Private Coaching Report</h3>
              <p className="opacity-90">Your Store • Today • 2:30pm</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">88%</div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                  <div className="text-sm text-gray-600">Uniforms</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">78%</div>
                  <div className="text-sm text-gray-600">Cleanliness</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                  <div className="text-sm text-gray-600">Safety</div>
                </div>
              </div>
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Your Action Items
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <div className="font-medium">Wipe down prep counter</div>
                        <div className="text-sm text-gray-600 mt-1">Visible residue on main prep surface</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">0:32</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <div className="font-medium">Replace missing floor mat</div>
                        <div className="text-sm text-gray-600 mt-1">Anti slip mat missing at fryer station</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">1:15</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <div className="font-medium">Great job on uniform compliance!</div>
                        <div className="text-sm text-gray-600 mt-1">All team members wearing proper hats and aprons</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">All</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Eye className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <div className="font-medium text-blue-900">Private & Secure</div>
                      <div className="text-sm text-blue-700 mt-1">This report stays at your location. Source video deleted after processing.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Trial Offer */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Start Your 7-Day Free Trial
            </h2>
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 text-left max-w-2xl mx-auto">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-blue-800 text-sm">
                  <strong>Be among the first</strong> to experience private AI coaching. Start building better habits today.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">7</div>
                <p className="text-gray-600">Days unlimited coaching runs</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">$0</div>
                <p className="text-gray-600">No cost, no obligation</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">📱</div>
                <p className="text-gray-600">Works on any smartphone</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl pulse">
              Start My Free Trial
            </button>
            <p className="text-sm text-gray-500 mt-4">No special hardware required</p>
          </div>
        </div>
      </section>

      {/* Future Upgrade */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Future Upgrade (Optional)
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              When you're ready, your brand can unlock:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold">Inspection Mode</h3>
              </div>
              <p className="text-gray-600">Official, auditable records with full compliance tracking.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="flex items-center mb-4">
                <Eye className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold">Corporate Dashboards</h3>
              </div>
              <p className="text-gray-600">Region wide trends, heatmaps, and compliance reporting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Coaching today. Confidence tomorrow.
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Start building better habits with quick, private AI checks. See your store the way an inspector would without waiting for one to show up.
          </p>
          <button className="bg-blue-600 text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center">
            <ArrowRight className="mr-2 h-5 w-5" />
            Try Coaching Mode Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}