import React from 'react';
import { cn } from '@/lib/cn';

export const AuroraBackground: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('fixed inset-0 -z-10 overflow-hidden', className)}>
      <div className="absolute inset-0">
        {/* Primary aurora */}
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl animate-glowPulse"
          style={{
            filter: 'blur(60px)',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Secondary aurora */}
        <div 
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-blue-600/15 via-indigo-500/15 to-cyan-500/15 blur-3xl animate-glowPulse"
          style={{
            filter: 'blur(50px)',
            transform: 'translate(50%, 50%)',
            animationDelay: '2s'
          }}
        />
        
        {/* Tertiary aurora */}
        <div 
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 blur-2xl animate-glowPulse"
          style={{
            filter: 'blur(40px)',
            transform: 'translate(-50%, -50%)',
            animationDelay: '4s'
          }}
        />
      </div>
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 grid-bg opacity-30"
        style={{
          backgroundSize: '36px 36px',
          animation: 'gridMove 8s linear infinite'
        }}
      />
    </div>
  );
};
