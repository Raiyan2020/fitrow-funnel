import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
      <div 
        className="h-full bg-brand-lime transition-all duration-500 ease-out shadow-[0_0_10px_rgb(var(--brand-lime)/0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;