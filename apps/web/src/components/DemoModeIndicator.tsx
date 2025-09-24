import React, { useState } from 'react';
import { Info, X, ExternalLink, Users, Database, Shield } from 'lucide-react';

export default function DemoModeIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem('demo-banner-dismissed') === 'true'
  );

  if (isDismissed) {
    return (
      <button
        onClick={() => {
          setIsDismissed(false);
          localStorage.removeItem('demo-banner-dismissed');
        }}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        title="Show demo information"
      >
        <Info className="w-5 h-5" />
      </button>
    );
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('demo-banner-dismissed', 'true');
  };

  const demoCredentials = [
    { role: 'Administrator', username: 'admin', description: 'Full system access' },
    { role: 'Manager', username: 'manager', description: 'Store management access' },
    { role: 'Inspector', username: 'inspector', description: 'Inspection queue access' },
  ];

  const demoFeatures = [
    { icon: Users, title: 'Multiple User Roles', description: 'Experience different user perspectives' },
    { icon: Database, title: 'Rich Sample Data', description: 'Pre-populated with realistic scenarios' },
    { icon: Shield, title: 'Safe Environment', description: 'No real data, perfect for testing' },
  ];

  return (
    <>
      {/* Mobile/Compact Banner */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">Demo Mode</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded"
            >
              {isExpanded ? 'Hide' : 'Info'}
            </button>
            <button onClick={handleDismiss} className="p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-white border-opacity-20">
            <p className="text-xs mb-2">Try these demo accounts (password: demo123):</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {demoCredentials.map((cred) => (
                <div key={cred.username} className="bg-white bg-opacity-10 p-1 rounded">
                  <div className="font-medium">{cred.username}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Banner */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">VerityInspect Demo</h3>
                  <p className="text-sm text-blue-100">
                    Explore our AI-powered restaurant inspection platform
                  </p>
                </div>
              </div>
              
              <div className="hidden xl:flex items-center space-x-6 ml-8">
                {demoFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-center space-x-2">
                    <feature.icon className="w-4 h-4 text-blue-200" />
                    <span className="text-sm text-blue-100">{feature.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {isExpanded ? 'Hide Details' : 'Demo Accounts'}
              </button>
              
              <a
                href="https://verityinspect.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <span>Learn More</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Demo Accounts */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Demo Accounts
                  </h4>
                  <div className="space-y-2">
                    {demoCredentials.map((cred) => (
                      <div key={cred.username} className="bg-white bg-opacity-10 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{cred.role}</div>
                            <div className="text-xs text-blue-200">{cred.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono bg-black bg-opacity-20 px-2 py-1 rounded">
                              {cred.username}
                            </div>
                            <div className="text-xs text-blue-200 mt-1">demo123</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demo Features */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    What's Included
                  </h4>
                  <div className="space-y-2 text-sm text-blue-100">
                    <div>• Multiple restaurant brands and locations</div>
                    <div>• Realistic inspection scenarios</div>
                    <div>• Sample videos and analysis results</div>
                    <div>• Complete workflow demonstrations</div>
                    <div>• Mobile capture interface</div>
                    <div>• Inspector queue management</div>
                  </div>
                </div>

                {/* Quick Start */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Quick Start
                  </h4>
                  <div className="space-y-2 text-sm text-blue-100">
                    <div>1. Login with any demo account</div>
                    <div>2. Explore the dashboard</div>
                    <div>3. Try uploading a video</div>
                    <div>4. Review inspection results</div>
                    <div>5. Test mobile capture (on mobile)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}