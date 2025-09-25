import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Calculator, DollarSign, Building, Users, Phone } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ROICalculatorWidget from '../components/ROICalculatorWidget';
import { TRIAL_SIGNUP_URL } from '../config/urls';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Simple pricing. 
              <span className="text-blue-600"> Big savings.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Start with Coaching Mode free, then scale to enterprise inspections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={TRIAL_SIGNUP_URL}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 inline-flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </a>
              <Link
                to="/demo"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Get a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Enterprise Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise Pricing
            </h2>
            <p className="text-xl text-gray-600">Simple per store pricing with volume discounts</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Small Brands */}
            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <div className="text-center mb-6">
                <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Small Brands</h3>
                <p className="text-gray-600">Under 200 stores</p>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">$90</div>
                <div className="text-gray-500">per store/month</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Coaching + Inspection Modes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Basic corporate dashboards</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Email support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Standard API access</span>
                </li>
              </ul>
              <Link
                to="/contact"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center font-semibold"
              >
                Contact Sales
              </Link>
            </div>

            {/* Mid-size */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-blue-500 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <div className="text-center mb-6">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Mid Size</h3>
                <p className="text-gray-600">200 to 1,000 stores</p>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">$70</div>
                <div className="text-gray-500">per store/month</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Everything in Small Brands</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Advanced analytics & heatmaps</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Priority phone support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Custom integrations</span>
                </li>
              </ul>
              <Link
                to="/contact"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center font-semibold"
              >
                Contact Sales
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <div className="text-center mb-6">
                <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-gray-600">1,000+ stores</p>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">$50-65</div>
                <div className="text-gray-500">per store/month</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Everything in Mid Size</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Custom reporting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Dedicated success manager</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>SLA guarantees</span>
                </li>
              </ul>
              <Link
                to="/contact"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center font-semibold"
              >
                Contact Sales
              </Link>
            </div>
          </div>
          <div className="text-center mt-12">
            <div className="bg-blue-100 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">Very Large Brands (5,000+ stores)</h4>
              <p className="text-blue-800">Custom flat license options available. Contact us for a personalized quote.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Trial Offer */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 rounded-2xl p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Free Trial Offer (Coaching Mode)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">7 Days</div>
                <p className="text-gray-600">Free trial period</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">∞</div>
                <p className="text-gray-600">Unlimited coaching runs</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">📱</div>
                <p className="text-gray-600">Works on any smartphone</p>
              </div>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              No credit card required. Start coaching your team today.
            </p>
            <Link
              to="/coaching-mode"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compare Plans
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Coaching Mode */}
            <div className="bg-green-50 rounded-xl p-8 border-2 border-green-100">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-green-800 mb-2">Coaching Mode</h3>
                <div className="text-lg text-green-700">Free Trial</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Unlimited coaching runs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Private, ephemeral videos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Store only scorecards</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Actionable tasks for managers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <span>Free, no credit card</span>
                </li>
              </ul>
              <Link
                to="/coaching-mode"
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center font-semibold"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-100">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-2">Enterprise</h3>
                <div className="text-lg text-blue-700">Paid Plans</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span>Coaching + Inspection Modes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span>Official, auditable records</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span>Corporate dashboards & heatmaps</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span>Travel savings 50 to 70%</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                  <span>From $50 to $90 per store/month</span>
                </li>
              </ul>
              <Link
                to="/demo"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center font-semibold"
              >
                Get Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Calculate Your ROI</h2>
            <p className="text-gray-600">See how much VerityInspect can save your business</p>
          </div>
          <ROICalculatorWidget />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing FAQ</h2>
            <p className="text-gray-600">Common questions about our pricing and plans</p>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3">What's included in the free trial?</h3>
              <p className="text-gray-600">
                The 7 day free trial includes unlimited coaching runs, full AI analysis, and private scorecards. 
                No credit card required, and you can upgrade to enterprise features anytime.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3">Is Coaching Mode really private?</h3>
              <p className="text-gray-600">
                Yes! Videos are automatically deleted after AI processing. Results stay at your store level only, 
                with no corporate visibility or tracking during coaching mode.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3">Do I need special hardware?</h3>
              <p className="text-gray-600">
                No special hardware required. VerityInspect works on any smartphone with a camera. 
                Just download our app or use the web interface.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3">What happens after the trial?</h3>
              <p className="text-gray-600">
                You can continue using coaching mode or upgrade to enterprise plans for official compliance tracking, 
                corporate dashboards, and additional features.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3">Is there an annual contract required?</h3>
              <p className="text-gray-600">
                Enterprise plans offer both monthly and annual billing options. Annual plans include discounts, 
                but we're flexible on contract terms for the right partnership.
              </p>
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
            Start with free coaching or talk to our sales team about enterprise rollouts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/coaching-mode"
              className="bg-green-600 text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              Try Coaching Free
            </Link>
            <Link
              to="/contact"
              className="bg-blue-600 text-white px-10 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              <Phone className="mr-2 h-5 w-5" />
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}