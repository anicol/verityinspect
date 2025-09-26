import { ArrowRight, Clock, Target, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NextStepCTAProps {
  onNextCheck?: () => void;
}

export default function NextStepCTA({ onNextCheck }: NextStepCTAProps) {
  const navigate = useNavigate();

  const handleNextCheck = () => {
    if (onNextCheck) {
      onNextCheck();
    } else {
      navigate('/upload');
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white text-center">
      <div className="max-w-md mx-auto space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <Camera className="h-8 w-8" />
          </div>
        </div>
        
        {/* Main CTA */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Do My Next Check
          </h2>
          <p className="text-indigo-100">
            Just 2 minutes. Daily checks = no more surprises.
          </p>
        </div>
        
        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-indigo-200" />
            <span className="text-xs text-indigo-100">2 min</span>
          </div>
          <div className="text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-indigo-200" />
            <span className="text-xs text-indigo-100">Daily</span>
          </div>
          <div className="text-center">
            <div className="text-lg mb-1">📈</div>
            <span className="text-xs text-indigo-100">Results</span>
          </div>
        </div>
        
        {/* Button */}
        <button
          onClick={handleNextCheck}
          className="w-full bg-white text-indigo-600 font-semibold py-3 px-6 rounded-lg hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-center space-x-2 group"
        >
          <span>Start Next Inspection</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
        
        {/* Subtext */}
        <p className="text-xs text-indigo-200">
          Keep your momentum going • Build consistent habits
        </p>
      </div>
    </div>
  );
}