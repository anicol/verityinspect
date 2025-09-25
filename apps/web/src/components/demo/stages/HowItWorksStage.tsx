import { ArrowRight, Video, Zap, ClipboardList } from 'lucide-react';
import DemoProgress from '../DemoProgress';

interface HowItWorksStageProps {
  onComplete: () => void;
}

export default function HowItWorksStage({ onComplete }: HowItWorksStageProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* Progress indicator */}
      <DemoProgress currentStage="how-it-works" welcomeCompleted={true} />
      
      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
          Your Daily 2-Minute Check
        </h1>
        
        {/* Steps */}
        <div className="space-y-8 mb-12">
          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg text-gray-800">
                Record a short video walkthrough (front, prep, exits, restrooms).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg text-gray-800">
                Our AI reviews instantly for safety, cleanliness, and uniforms.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg text-gray-800">
                You get a private scorecard with clear action items.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Callout */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12 text-center">
          <p className="text-blue-800 font-medium mb-2">
            🔒 Complete Privacy
          </p>
          <p className="text-blue-700">
            Videos are deleted after processing. Results stay at your store only.
            <br />
            No judgment, no corporate oversight — just private feedback to help you succeed.
          </p>
        </div>
        
        {/* CTA Button */}
        <div className="text-center">
          <button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-8 md:py-4 md:px-8 rounded-lg font-medium text-lg transition-colors inline-flex items-center min-h-[50px] min-w-[200px] justify-center"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}