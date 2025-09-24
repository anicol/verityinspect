import { Link } from 'react-router-dom';
import { Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showSupportDropdown, setShowSupportDropdown] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">VerityInspect</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {/* Product Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setShowProductDropdown(true)}
              onMouseLeave={() => setShowProductDropdown(false)}
            >
              <button className="flex items-center text-gray-600 hover:text-gray-900 py-2">
                Product
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {showProductDropdown && (
                <div className="absolute top-full left-0 w-48 bg-white rounded-md shadow-lg border z-50">
                  <div className="py-1">
                    <Link
                      to="/coaching-mode"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowProductDropdown(false)}
                    >
                      Coaching Mode
                    </Link>
                    <Link
                      to="/enterprise"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowProductDropdown(false)}
                    >
                      Corporate / Enterprise
                    </Link>
                    <Link
                      to="/pricing"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowProductDropdown(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      to="/demo"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowProductDropdown(false)}
                    >
                      Demo
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Company Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setShowCompanyDropdown(true)}
              onMouseLeave={() => setShowCompanyDropdown(false)}
            >
              <button className="flex items-center text-gray-600 hover:text-gray-900 py-2">
                Company
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {showCompanyDropdown && (
                <div className="absolute top-full left-0 w-48 bg-white rounded-md shadow-lg border z-50">
                  <div className="py-1">
                    <Link
                      to="/about"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowCompanyDropdown(false)}
                    >
                      About
                    </Link>
                    <Link
                      to="/contact"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowCompanyDropdown(false)}
                    >
                      Contact
                    </Link>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-400"
                    >
                      Careers
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Support Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setShowSupportDropdown(true)}
              onMouseLeave={() => setShowSupportDropdown(false)}
            >
              <button className="flex items-center text-gray-600 hover:text-gray-900 py-2">
                Support
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {showSupportDropdown && (
                <div className="absolute top-full left-0 w-48 bg-white rounded-md shadow-lg border z-50">
                  <div className="py-1">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-400"
                    >
                      Help Center
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-400"
                    >
                      Status
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-400"
                    >
                      API
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-400"
                    >
                      Documentation
                    </a>
                  </div>
                </div>
              )}
            </div>

            <Link to="/roi-calculator" className="text-gray-600 hover:text-gray-900">
              ROI Calculator
            </Link>

            <div className="flex items-center space-x-3">
              <Link
                to="/coaching-mode"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                to="/demo"
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Get Demo
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}