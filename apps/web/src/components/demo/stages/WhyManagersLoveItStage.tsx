import { ArrowRight, CheckCircle } from 'lucide-react';
import DemoProgress from '../DemoProgress';

interface WhyManagersLoveItStageProps {
  onComplete: () => void;
}

export default function WhyManagersLoveItStage({ onComplete }: WhyManagersLoveItStageProps) {
  const benefits = [
    "Never get blindsided by inspections again",
    "Train your team in real time", 
    "Reduce stress and look good to corporate"
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Progress indicator */}
      <DemoProgress currentStage="why-managers" welcomeCompleted={true} howItWorksCompleted={true} />
      
      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
          No more surprises
        </h1>
        
        {/* Benefits with checkmarks */}
        <div className="space-y-6 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-lg text-gray-800 leading-relaxed">
                {benefit}
              </p>
            </div>
          ))}
        </div>

        {/* Subtext */}
        <div className="text-center mb-12">
          <p className="text-gray-600 text-lg italic">
            Think of it as your private practice mode — no judgment, just fast feedback.
          </p>
        </div>
        
        {/* CTA Button */}
        <div className="text-center">
          <button 
            onClick={onComplete}
            className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-8 md:py-4 md:px-8 rounded-lg font-medium text-lg transition-colors inline-flex items-center min-h-[50px] min-w-[200px] justify-center"
          >
            Show Me an Example
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}