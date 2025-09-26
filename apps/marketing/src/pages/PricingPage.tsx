import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Calculator, Phone, Mail, Shield, Smartphone, Infinity, Play, TrendingUp, Users, BarChart3 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TRIAL_SIGNUP_URL } from '../config/urls';

export default function PricingPage() {
  const [storeCount, setStoreCount] = useState(50);
  const [costPerVisit, setCostPerVisit] = useState(750);
  const [visitsPerYear, setVisitsPerYear] = useState(4);

  const annualSavings = Math.round((storeCount * visitsPerYear * costPerVisit * 0.65));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const faqItems = [
    {
      question: "What does the free trial include?",
      answer: "One store, 10 videos, Coaching Mode only. Private results, videos deleted after processing."
    },
    {
      question: "Do I need a credit card for the free trial?",
      answer: "No, start risk-free."
    },
    {
      question: "Will corporate see my coaching videos?",
      answer: "No, all coaching videos are private and deleted after processing."
    },
    {
      question: "How fast do I see results?",
      answer: "Within 10 minutes of your first upload, you'll see real AI detections in your store."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              AI Inspections for Every Level of Your Business
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Start free with Coaching. Scale to Corporate when you're ready.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 mb-8 text-lg">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-300 mr-2" />
                <span>Free trial — no credit card required</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-300 mr-2" />
                <span>Instant AI scorecards</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-300 mr-2" />
                <span>Proven ROI at enterprise scale</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/coaching"
                className="px-8 py-4 bg-teal-400 text-teal-900 rounded-lg hover:bg-teal-300 transition-colors font-semibold text-lg shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/enterprise"
                className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Coaching Program */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Coaching Program
            </h2>
            <p className="text-xl text-gray-600">
              Private AI coaching to build confidence and reduce inspection stress.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Starter Coaching */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter Coaching</h3>
                  <div className="text-4xl font-bold text-teal-600 mb-4">$49</div>
                  <div className="text-gray-600">per store/month</div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited coaching videos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Private scorecards</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Videos deleted after processing</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Actionable to-do lists</span>
                  </li>
                </ul>
                
                <Link
                  to="/coaching"
                  className="block w-full text-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                >
                  Start Free →
                </Link>
              </div>

              {/* Pro Coaching */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 p-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Coaching</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-4">$79</div>
                  <div className="text-gray-600">per store/month</div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Everything in Starter</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Multi-manager coaching analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Optional report sharing with corporate</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Team trend tracking</span>
                  </li>
                </ul>
                
                <Link
                  to="/coaching"
                  className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Start Free →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Program */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Corporate Program
            </h2>
            <p className="text-xl text-gray-600">
              Scale inspections, cut travel costs, and ensure compliance.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Essentials */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Essentials</h3>
                <p className="text-gray-600 mb-6">For emerging brands (under 200 locations)</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Coaching + Inspection Mode</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Official compliance records</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Corporate dashboards</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Email support</span>
                </li>
              </ul>
            </div>

            {/* Professional */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600 mb-6">For growth brands (200–1,000 locations)</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Everything in Essentials</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Advanced analytics & compliance heatmaps</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority phone support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Workflow integrations</span>
                </li>
              </ul>
            </div>

            {/* Enterprise Elite */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Elite</h3>
                <p className="text-gray-600 mb-6">For large brands (1,000+ locations)</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Everything in Professional</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Dedicated success manager</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">SLA guarantees</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Custom reporting & enterprise workflow integration</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pricing Note */}
          <div className="bg-blue-50 rounded-2xl p-8 text-center max-w-4xl mx-auto mb-8">
            <div className="flex items-start justify-center mb-4">
              <div className="text-2xl mr-2">📌</div>
              <div className="text-left">
                <p className="text-gray-700 mb-4">
                  <strong>Pricing is customized by brand size and program level.</strong> On average, VerityInspect delivers 50–70% travel savings, often saving $650K–$1.8M annually for a 1,300-store brand.
                </p>
              </div>
            </div>
            <Link
              to="/enterprise"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Talk to Sales →
            </Link>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              VerityInspect Pays for Itself
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Current Costs</h3>
                <p className="text-gray-700">Average in-person inspection costs: <strong>$500–$1,000 per visit</strong></p>
              </div>

              <div className="bg-green-50 p-8 rounded-2xl border border-green-200 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calculator className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Break Even</h3>
                <p className="text-gray-700">With VerityInspect, <strong>even one reduced trip per month</strong> covers the investment</p>
              </div>

              <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Scale Impact</h3>
                <p className="text-gray-700">Brands save <strong>up to $1.8M annually</strong> while increasing coverage 3–5×</p>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                to="/roi"
                className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
              >
                Calculate Your Savings →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start where you are. Scale when you're ready.
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Coaching builds confidence. Corporate drives compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={TRIAL_SIGNUP_URL}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
            >
              Start Free Trial
            </a>
            <Link
              to="/enterprise"
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}