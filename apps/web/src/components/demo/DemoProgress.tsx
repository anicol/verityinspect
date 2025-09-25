interface DemoProgressProps {
  currentStage: 'watch' | 'try' | 'do';
  watchCompleted?: boolean;
  tryCompleted?: boolean;
  className?: string;
}

export default function DemoProgress({ currentStage, watchCompleted = false, tryCompleted = false, className = '' }: DemoProgressProps) {
  const stages = ['watch', 'try', 'do'];
  
  const getStageStatus = (stageId: string) => {
    if (stageId === 'watch' && watchCompleted) return 'completed';
    if (stageId === 'try' && tryCompleted) return 'completed';
    if (stageId === currentStage) return 'active';
    
    const currentIndex = stages.indexOf(currentStage);
    const stageIndex = stages.indexOf(stageId);
    
    if (stageIndex < currentIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <div className="flex items-center space-x-3">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          
          return (
            <div key={stage}>
              <div 
                className={`transition-all duration-300 ${
                  isActive 
                    ? 'w-6 h-2 bg-gray-900 rounded-full' 
                    : isCompleted
                    ? 'w-2 h-2 bg-gray-900 rounded-full'
                    : 'w-2 h-2 bg-gray-300 rounded-full'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}