import { Upload } from 'lucide-react';

interface SmartUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (scenario?: string) => void;
}

export default function SmartUploadModal({
  isOpen,
  onClose,
  onUpload
}: SmartUploadModalProps) {
  if (!isOpen) return null;

  const handleUpload = () => {
    onUpload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        <div className="text-center p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Now try with YOUR video!
            </h2>
          </div>
          
          <button
            onClick={handleUpload}
            className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-8 rounded-lg font-medium text-lg transition-colors mb-4 w-full min-h-[50px] flex items-center justify-center"
          >
            Upload Video
          </button>
          
          <p className="text-gray-600">
            30 seconds is all you need
          </p>
        </div>
      </div>
    </div>
  );
}