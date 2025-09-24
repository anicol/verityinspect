import { useState } from 'react';
import { X, Upload, Clock, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadScenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  timeEstimate: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  tips: string[];
  expectedFindings: string[];
}

const UPLOAD_SCENARIOS: UploadScenario[] = [
  {
    id: 'morning-prep',
    title: 'Morning Kitchen Prep',
    description: 'Perfect for first-time uploads. Capture your team setting up the kitchen for the day.',
    icon: '🌅',
    timeEstimate: '2-3 minutes',
    difficulty: 'Easy',
    tips: [
      'Film from a corner to capture multiple work stations',
      'Include food prep, equipment setup, and team interactions',
      'Make sure lighting is good - morning natural light works best'
    ],
    expectedFindings: [
      'PPE compliance during food handling',
      'Proper sanitization procedures',
      'Equipment safety checks'
    ]
  },
  {
    id: 'rush-service',
    title: 'Lunch Rush Service',
    description: 'Capture your team during peak service hours to identify efficiency opportunities.',
    icon: '🍽️',
    timeEstimate: '3-5 minutes',
    difficulty: 'Medium',
    tips: [
      'Position camera to see both kitchen and front counter',
      'Film during your busiest period for authentic insights',
      'Focus on customer service and food safety practices'
    ],
    expectedFindings: [
      'Service speed and accuracy',
      'Customer interaction quality',
      'Food safety during high-volume periods'
    ]
  },
  {
    id: 'closing-procedures',
    title: 'End-of-Day Closing',
    description: 'Advanced scenario focusing on cleanliness and procedural compliance.',
    icon: '🧹',
    timeEstimate: '4-6 minutes',
    difficulty: 'Advanced',
    tips: [
      'Document the complete closing checklist',
      'Include cleaning, equipment shutdown, and inventory',
      'Make sure all team members are visible during procedures'
    ],
    expectedFindings: [
      'Cleaning protocol adherence',
      'Equipment maintenance procedures',
      'Safety lockout procedures'
    ]
  }
];

interface SmartUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (scenario?: string) => void;
}

export default function SmartUploadModal({ isOpen, onClose, onUpload }: SmartUploadModalProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showCustomUpload, setShowCustomUpload] = useState(false);

  if (!isOpen) return null;

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
  };

  const handleUpload = () => {
    onUpload(selectedScenario || undefined);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-700 bg-green-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'Advanced': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ready for Your First Upload?</h2>
            <p className="text-gray-600 mt-1">Choose a scenario below or upload any video you'd like analyzed</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!showCustomUpload ? (
            <>
              {/* Scenario Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {UPLOAD_SCENARIOS.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedScenario === scenario.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleScenarioSelect(scenario.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{scenario.icon}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">{scenario.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Clock className="w-3 h-3 mr-1" />
                        {scenario.timeEstimate}
                      </div>

                      {selectedScenario === scenario.id && (
                        <div className="mt-4 p-3 bg-white rounded border animate-fadeIn">
                          <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Tips for Success
                          </h5>
                          <ul className="text-xs text-gray-600 space-y-1 mb-3">
                            {scenario.tips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                          
                          <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 text-blue-600" />
                            What AI Will Analyze
                          </h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {scenario.expectedFindings.map((finding, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => setShowCustomUpload(true)}
                  className="text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Or upload any video →
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedScenario}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                      selectedScenario
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Start Upload
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Custom Upload View */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Any Video</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Our AI can analyze any restaurant video. Drag and drop your file or click to browse.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-indigo-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-900">Click to upload</p>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-2">MP4, MOV, AVI up to 100MB</p>
                </div>
              </div>

              <div className="flex justify-center space-x-3 mt-6">
                <button
                  onClick={() => setShowCustomUpload(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Back to Scenarios
                </button>
                <button
                  onClick={() => onUpload()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}