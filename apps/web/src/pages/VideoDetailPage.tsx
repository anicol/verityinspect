import { useParams } from 'react-router-dom';

export default function VideoDetailPage() {
  const { id } = useParams();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Video Detail - {id}</h1>
      <p className="text-gray-600">Video detail page coming soon...</p>
    </div>
  );
}