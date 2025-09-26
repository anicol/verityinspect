import { Shield, Clock, Trash2 } from 'lucide-react';

interface PrivacyBannerProps {
  mode?: 'INSPECTION' | 'COACHING';
  expiresAt?: string;
}

export default function PrivacyBanner({ mode = 'COACHING', expiresAt }: PrivacyBannerProps) {
  const getRetentionMessage = () => {
    if (mode === 'COACHING') {
      return {
        icon: <Trash2 className="h-5 w-5 text-green-600" />,
        message: "Video deleted after processing. Your results are private to this store.",
        detail: "Coaching mode videos are automatically removed within 7 days for your privacy.",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    } else {
      const retentionDays = expiresAt ? 
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 365;
      
      return {
        icon: <Clock className="h-5 w-5 text-blue-600" />,
        message: `Inspection data retained for compliance (${retentionDays} days remaining).`,
        detail: "Your data is securely stored and only accessible by authorized personnel.",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      };
    }
  };

  const { icon, message, detail, bgColor, borderColor } = getRetentionMessage();

  return (
    <div className={`${bgColor} ${borderColor} border-2 rounded-lg p-4`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <Shield className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                {icon}
                {message}
              </p>
              <p className="text-xs text-gray-600">
                {detail}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Encrypted storage</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>GDPR compliant</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Store-level access only</span>
        </div>
      </div>
    </div>
  );
}