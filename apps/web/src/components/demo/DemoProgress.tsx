interface DemoProgressProps {
  currentStage: 'welcome' | 'how-it-works' | 'why-managers' | 'first-run';
  welcomeCompleted?: boolean;
  howItWorksCompleted?: boolean;
  whyManagersCompleted?: boolean;
  className?: string;
}

export default function DemoProgress({ 
  currentStage, 
  welcomeCompleted = false, 
  howItWorksCompleted = false, 
  whyManagersCompleted = false, 
  className = '' 
}: DemoProgressProps) {
  const stages = ['welcome', 'how-it-works', 'why-managers', 'first-run'];
  
  const getStageStatus = (stageId: string) => {
    if (stageId === 'welcome' && welcomeCompleted) return 'completed';
    if (stageId === 'how-it-works' && howItWorksCompleted) return 'completed';
    if (stageId === 'why-managers' && whyManagersCompleted) return 'completed';
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