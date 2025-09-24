import { Link } from 'react-router-dom';
import { Shield, Users, Target, Lightbulb, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Transforming Inspections with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We believe inspections should empower managers and brands, not stress them out. 
              That's why we built VerityInspect to start with coaching, not compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                Traditional inspections create stress, surprise managers with issues they didn't know existed, 
                and cost brands thousands in travel expenses. We saw a better way.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                VerityInspect transforms the inspection process by putting coaching first. Managers get 
                private, instant feedback to improve before official inspections. Brands get consistent, 
                objective scoring at scale with massive travel savings.
              </p>
              <div className="flex items-center text-blue-600 font-semibold">
                <Target className="h-5 w-5 mr-2" />
                Building better inspection experiences for everyone
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">50-70%</div>
                  <div className="text-gray-600">Travel cost reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">3-5x</div>
                  <div className="text-gray-600">More inspections per inspector</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-gray-600">Consistent AI scoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we build</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Manager First</h3>
              <p className="text-gray-600">
                We believe managers should feel empowered, not surprised. Every feature starts with 
                asking how it helps store teams succeed.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Privacy by Design</h3>
              <p className="text-gray-600">
                Privacy isn't an afterthought. Our coaching mode automatically deletes videos and 
                keeps results private at the store level.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Continuous Innovation</h3>
              <p className="text-gray-600">
                We're constantly improving our AI models and adding new features based on real 
                feedback from managers and brands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg text-gray-600 max-w-none">
              <p className="mb-6">
                VerityInspect was born from a simple observation: traditional inspections were broken. 
                Store managers lived in fear of surprise audits, brands spent fortunes on travel costs, 
                and the whole process created more stress than value.
              </p>
              <p className="mb-6">
                We asked a different question: What if inspections could coach managers to improve 
                before problems became issues? What if AI could provide consistent, objective scoring 
                without the cost and scheduling complexity of human inspectors?
              </p>
              <p className="mb-6">
                The answer became VerityInspect's dual mode approach. Coaching Mode gives managers 
                private, immediate feedback to build confidence and improve standards. Inspection Mode 
                provides brands with official compliance tracking and corporate visibility when needed.
              </p>
              <p>
                Today, we're helping restaurant brands transform their inspection economics while 
                empowering managers with the tools they need to succeed. And we're just getting started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Inspections?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join the brands and managers already benefiting from coaching first inspections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/coaching-mode"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center"
            >
              Try Coaching Mode Free
            </Link>
            <Link
              to="/demo"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Get Enterprise Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}