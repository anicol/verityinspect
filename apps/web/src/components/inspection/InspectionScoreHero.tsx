import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface InspectionScoreHeroProps {
  score: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export default function InspectionScoreHero({ score, status }: InspectionScoreHeroProps) {
  const getScoreDisplay = () => {
    if (status === 'PROCESSING') {
      return {
        display: 'Processing...',
        message: 'We\'re analyzing your video now. This usually takes 2-3 minutes.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      };
    }

    if (status === 'FAILED') {
      return {
        display: 'Analysis Failed',
        message: 'Something went wrong analyzing your video. Please try uploading again.',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: <XCircle className="h-16 w-16 text-red-600" />
      };
    }

    if (status === 'PENDING') {
      return {
        display: 'Queued',
        message: 'Your video is in the queue for analysis. We\'ll start processing it shortly.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: <AlertTriangle className="h-16 w-16 text-yellow-600" />
      };
    }

    // Completed - show score and encouragement
    const getEncouragementMessage = (score: number): string => {
      if (score >= 95) return "Outstanding work — your team is setting the standard!";
      if (score >= 90) return "Excellent job — just a small tweak or two today.";
      if (score >= 85) return "Great work — you're almost there with a couple quick fixes.";
      if (score >= 80) return "Good progress — just a few things to tidy up today.";
      if (score >= 70) return "Nice effort — let's tackle these items one by one.";
      if (score >= 60) return "We're getting there — focus on these key areas today.";
      return "Let's work together to get these important items addressed.";
    };

    const getScoreColor = (score: number): string => {
      if (score >= 90) return 'text-green-600';
      if (score >= 80) return 'text-yellow-600';
      if (score >= 70) return 'text-orange-600';
      return 'text-red-600';
    };

    const getBgColor = (score: number): string => {
      if (score >= 90) return 'bg-green-50';
      if (score >= 80) return 'bg-yellow-50';
      if (score >= 70) return 'bg-orange-50';
      return 'bg-red-50';
    };

    return {
      display: `${Math.round(score)}% Ready`,
      message: getEncouragementMessage(score),
      color: getScoreColor(score),
      bgColor: getBgColor(score),
      icon: score >= 90 ? <CheckCircle className="h-16 w-16 text-green-600" /> : <AlertTriangle className="h-16 w-16 text-yellow-600" />
    };
  };

  const { display, message, color, bgColor, icon } = getScoreDisplay();

  return (
    <div className={`${bgColor} rounded-lg p-8 text-center border-2 border-opacity-20`}>
      <div className="flex flex-col items-center space-y-4">
        {icon}
        <div>
          <h1 className={`text-4xl font-bold ${color} mb-2`}>
            {display}
          </h1>
          <p className="text-lg text-gray-700 max-w-md mx-auto">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}