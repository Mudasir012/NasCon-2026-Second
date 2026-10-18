import React from 'react';

export default function SkeletonLoader({ count = 5, type = 'table' }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-32 bg-[#e8e5de] rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-8 bg-[#e8e5de] rounded w-full"></div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-10 bg-[#f4f2ee] rounded w-full"></div>
      ))}
    </div>
  );
}
