import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#EAE2D3] rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="devtrack-card p-5 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="devtrack-card p-5 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-32" />
  </div>
);
