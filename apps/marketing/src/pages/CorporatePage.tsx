import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, TrendingUp, Shield, Users, BarChart, Zap, Globe, Lock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ROICalculator from '../components/ROICalculator';
import SEO from '../components/SEO';

export default function CorporatePage() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Enterprise Restaurant Inspections - Scale AI-Powered Compliance | PeakOps"
        description="Scale restaurant inspections across multiple locations with PeakOps Enterprise. Advanced analytics, custom integrations, and dedicated support for restaurant chains and franchises."
        keywords="enterprise restaurant inspections, restaurant chain compliance, multi-location inspections, franchise inspections, restaurant analytics, QSR enterprise software"
        url="https://getpeakops.com/enterprise"
        type="website"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              AI-powered video inspections at scale: <span className="text-blue-300">Coaching + Compliance</span> in one platform
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Transform your brand's inspection process with video-powered AI, delivering comprehensive coverage, consistent standards, and significant cost savings.
            </p>
            <div className="mb-8">
              <Link
                to="/demo"
                className="px-8 py-4 bg-blue-400 text-blue-900 rounded-lg hover:bg-blue-300 transition-colors font-semibold text-lg shadow-lg"
              >
                Get Demo
              </Link>
            </div>
            <p className="text-blue-200 text-sm">
              ✅ 50-70% travel savings • ✅ 3-5× inspection coverage • ✅ Consistent standards
            </p>
          </div>
        </div>
      </section>

      {/* Two Modes Explained */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Two Modes, Complete Coverage
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start with coaching for private store-level adoption, then scale to enterprise compliance when ready.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Coaching Mode */}
            <div className="bg-teal-50 p-8 rounded-2xl border border-teal-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Coaching Mode</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Private store-level adoption</div>
                    <div className="text-sm text-gray-600">Managers can use coaching mode independently without corporate oversight</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Store videos deleted after processing for complete privacy</div>
                    <div className="text-sm text-gray-600">Complete privacy during the coaching and improvement phase</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Instant feedback & improvement</div>
                    <div className="text-sm text-gray-600">Build confidence and compliance before official inspections</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-teal-200">
                <div className="text-sm text-teal-800 font-medium">Perfect for:</div>
                <div className="text-sm text-gray-600">Rolling out inspection processes, training new managers, building compliance culture</div>
              </div>
            </div>

            {/* Enterprise Mode */}
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <BarChart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Enterprise Mode</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Official compliance records from retained video inspections</div>
                    <div className="text-sm text-gray-600">Auditable reports for regulatory and corporate requirements</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Corporate dashboards & analytics</div>
                    <div className="text-sm text-gray-600">Regional trends, compliance heatmaps, and performance tracking</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Integration & automation</div>
                    <div className="text-sm text-gray-600">Connect to task management systems and enterprise workflows</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800 font-medium">Perfect for:</div>
                <div className="text-sm text-gray-600">Corporate compliance, franchise oversight, regulatory reporting, performance management</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Brands */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transformative Benefits for Brands
            </h2>
            <p className="text-xl text-gray-600">
              See the measurable impact on your operations and bottom line
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">50-70%</h3>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Travel Savings</h4>
              <p className="text-gray-600">
                Dramatically reduce inspection travel costs while increasing coverage frequency.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600 mb-2">3-5×</h3>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Inspection Coverage</h4>
              <p className="text-gray-600">
                Inspect more locations more frequently with the same budget and resources.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600 mb-2">100%</h3>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Objective Scoring</h4>
              <p className="text-gray-600">
                AI video analysis eliminates inspector bias and subjective evaluations.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-orange-600 mb-2">Real-time</h3>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Regional Insights</h4>
              <p className="text-gray-600">
                Dashboards reveal patterns, trends, and recurring issues across your network.
              </p>
            </div>
          </div>

          {/* Detailed Benefits */}
          <div className="mt-16 bg-white p-8 rounded-2xl shadow-lg">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Beyond Cost Savings: Strategic Advantages
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Proactive compliance culture</div>
                      <div className="text-sm text-gray-600">Shift from reactive auditing to proactive improvement</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Scalable expansion support</div>
                      <div className="text-sm text-gray-600">Maintain standards during rapid growth without proportional cost increases</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Data-driven decision making</div>
                      <div className="text-sm text-gray-600">Identify systemic issues and optimize operations based on comprehensive data</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Enhanced manager confidence</div>
                      <div className="text-sm text-gray-600">Private coaching mode builds skills before formal evaluations</div>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Enterprise dashboard analytics"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">Enterprise Dashboard Preview</h4>
                  <p className="text-sm text-gray-600">Real-time insights across your entire network</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Embed */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Calculate Your Enterprise ROI
            </h2>
            <p className="text-xl text-gray-600">
              See the exact financial impact for your brand
            </p>
          </div>
          
          <ROICalculator />
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Security & Configurable Privacy
            </h2>
            <p className="text-xl text-gray-600">
              Your data protection requirements, precisely met
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Configurable Retention Policies</h3>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Coaching Mode</div>
                    <div className="text-sm text-gray-600">Private video processing with automatic deletion after analysis</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Enterprise Mode</div>
                    <div className="text-sm text-gray-600">Configurable video retention (30 days to 7 years) based on compliance needs</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Custom policies</div>
                    <div className="text-sm text-gray-600">Set different retention rules for different regions or store types</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Data Security & Compliance</h3>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">SOC 2 Type II certified</div>
                    <div className="text-sm text-gray-600">Independently audited security controls and procedures</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">End-to-end encryption</div>
                    <div className="text-sm text-gray-600">Data encrypted in transit and at rest with enterprise-grade protocols</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">GDPR & CCPA compliant</div>
                    <div className="text-sm text-gray-600">Full compliance with international privacy regulations</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seamless Enterprise Integrations
            </h2>
            <p className="text-xl text-gray-600">
              Connect PeakOps to your existing workflow and systems
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Popular Integrations
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm">CT</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">CrunchTime</div>
                    <div className="text-sm text-gray-600">Automatic task creation and assignment</div>
                  </div>
                </li>
                <li className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm">MU</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">MeazureUp</div>
                    <div className="text-sm text-gray-600">Compliance scoring and reporting integration</div>
                  </div>
                </li>
                <li className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm">API</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Custom API Integration</div>
                    <div className="text-sm text-gray-600">Connect to any system with webhooks and REST API</div>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Enterprise API Features</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Real-time webhooks for instant notifications</li>
                  <li>• RESTful API for custom integrations</li>
                  <li>• Bulk data export and reporting</li>
                  <li>• Single Sign-On (SSO) support</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-gray-900">Sample Webhook Payload</h4>
                </div>
                <pre className="text-xs bg-gray-50 p-3 rounded border text-gray-700 overflow-x-auto">
{`{
  "event": "inspection_completed",
  "store_id": "store_123",
  "inspection_id": "insp_456",
  "overall_score": 88,
  "categories": {
    "cleanliness": 78,
    "safety": 95,
    "uniforms": 92
  },
  "action_items": [
    {
      "priority": "high",
      "category": "cleanliness",
      "description": "Clean drink station"
    }
  ],
  "completed_at": "2024-03-15T14:30:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Invite */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Partner with us to prove proactive inspections at scale
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join our enterprise pilot program and help shape the future of brand compliance. We'll work directly with your team to customize the platform for your specific needs.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white bg-opacity-20 p-6 rounded-xl">
                  <h3 className="font-semibold mb-2">Custom Implementation</h3>
                  <p className="text-sm text-blue-100">Tailored setup for your brand standards and workflows</p>
                </div>
                <div className="bg-white bg-opacity-20 p-6 rounded-xl">
                  <h3 className="font-semibold mb-2">Dedicated Support</h3>
                  <p className="text-sm text-blue-100">Direct access to our development and customer success teams</p>
                </div>
                <div className="bg-white bg-opacity-20 p-6 rounded-xl">
                  <h3 className="font-semibold mb-2">Pilot Pricing</h3>
                  <p className="text-sm text-blue-100">Special rates for early enterprise adopters</p>
                </div>
              </div>
              
              <Link
                to="/demo"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
              >
                Request Enterprise Pilot
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Brand's Video Inspection Process?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Schedule a demo to see how PeakOps can deliver measurable ROI, consistent standards, and scalable compliance for your brand.
          </p>
          <Link
            to="/demo"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
          >
            Request Demo
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            30-minute demo • Custom ROI analysis • Implementation planning
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}