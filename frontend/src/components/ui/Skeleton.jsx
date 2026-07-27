import React from 'react';

const Skeleton = ({ className = '', variant = 'rect' }) => {
  const baseStyle = 'skeleton rounded bg-surface-container';
  
  const variants = {
    rect: '',
    circle: 'rounded-full',
    text: 'h-4 w-full',
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`} />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 p-base shadow-sm">
      <Skeleton className="h-56 w-full rounded-xl mb-sm" />
      <div className="p-sm space-y-sm">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-6 w-12 rounded" />
        </div>
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <div className="flex justify-between pt-sm items-center">
          <div className="flex items-center gap-xs">
            <Skeleton variant="circle" className="w-6 h-6" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
