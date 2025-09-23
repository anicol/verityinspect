import { useParams } from 'react-router-dom';

export default function InspectionDetailPage() {
  const { id } = useParams();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inspection Detail - {id}</h1>
      <p className="text-gray-600">Inspection detail page coming soon...</p>
    </div>
  );
}