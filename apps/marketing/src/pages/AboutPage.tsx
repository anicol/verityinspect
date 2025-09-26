import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, TrendingUp, Shield, Users, Target, Heart, Lightbulb } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Transforming Inspections with <span className="text-teal-300">AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              We believe inspections should empower managers and brands, not stress them out. That's why we built VerityInspect to start with coaching, not compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Our Mission
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Traditional inspections create stress, surprise managers with issues they didn't know existed, and cost brands thousands in travel expenses. We saw a better way.
              </p>
              <p>
                VerityInspect transforms the inspection process by putting coaching first. Managers get private, instant feedback to improve before official inspections. Brands get consistent, objective scoring at scale with massive travel savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Building Better Experiences */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Building better inspection experiences for everyone
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-green-600 mb-2">50-70%</h3>
              <p className="text-gray-700 font-medium">Travel cost reduction</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-blue-600 mb-2">3-5×</h3>
              <p className="text-gray-700 font-medium">More inspections per inspector</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-purple-600 mb-2">100%</h3>
              <p className="text-gray-700 font-medium">Consistent AI scoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we build
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-teal-50 p-8 rounded-2xl border border-teal-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mr-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Manager First</h3>
              </div>
              <p className="text-gray-700">
                We believe managers should feel empowered, not surprised. Every feature starts with asking how it helps store teams succeed.
              </p>
            </div>

            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Privacy by Design</h3>
              </div>
              <p className="text-gray-700">
                Privacy isn't an afterthought. Our coaching mode automatically deletes videos and keeps results private at the store level.
              </p>
            </div>

            <div className="bg-orange-50 p-8 rounded-2xl border border-orange-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Continuous Innovation</h3>
              </div>
              <p className="text-gray-700">
                We're constantly improving our AI models and adding new features based on real feedback from managers and brands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Our Story
            </h2>
            
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                VerityInspect was born from a simple observation: traditional inspections were broken. Store managers lived in fear of surprise audits, brands spent fortunes on travel costs, and the whole process created more stress than value.
              </p>
              
              <p>
                We asked a different question: What if inspections could coach managers to improve before problems became issues? What if AI could provide consistent, objective scoring without the cost and scheduling complexity of human inspectors?
              </p>
              
              <p>
                The answer became VerityInspect's dual mode approach. Coaching Mode gives managers private, immediate feedback to build confidence and improve standards. Inspection Mode provides brands with official compliance tracking and corporate visibility when needed.
              </p>
              
              <p>
                Today, we're helping restaurant brands transform their inspection economics while empowering managers with the tools they need to succeed. And we're just getting started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Inspections?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join the brands and managers already benefiting from coaching first inspections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/coaching"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
            >
              Try Coaching Mode Free
            </Link>
            <Link
              to="/enterprise"
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
            >
              Get Enterprise Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}