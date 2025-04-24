import React, { useEffect, useRef } from 'react';

const TaskSpinner = ({ size = "md", color = "#3b82f6" }) => {
  const svgRef = useRef(null);
  
  // Size variants
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48"
  };

  // Generate secondary and tertiary colors based on primary color
  const secondaryColor = color + "80"; // 50% opacity
  const tertiaryColor = color + "40";  // 25% opacity
  
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    // Reset animations on mount
    const elements = svg.querySelectorAll('.animated');
    elements.forEach(el => {
      el.style.animation = 'none';
      void el.offsetWidth; // Trigger reflow
      el.style.animation = null;
    });
    
    // Add random delays to some elements for more organic movement
    const randomElements = svg.querySelectorAll('.random-delay');
    randomElements.forEach(el => {
      const delay = Math.random() * 0.5;
      el.style.animationDelay = `${delay}s`;
    });
  }, []);

  return (
    <div className="flex justify-center items-center">
      <svg 
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 200 200" 
        className={`${sizeClasses[size]}`}
      >
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          
          {/* Filter for drop shadow */}
          <filter id="taskShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.3" />
          </filter>
          
          {/* Animation for the checkmark */}
          <style type="text/css">{`
            @keyframes rotateCircle {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes rotateCounterClockwise {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(-360deg); }
            }
            
            @keyframes dashOffset {
              0% { stroke-dashoffset: 600; }
              50% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: 600; }
            }
            
            @keyframes pulseOpacity {
              0% { opacity: 0.4; }
              50% { opacity: 1; }
              100% { opacity: 0.4; }
            }
            
            @keyframes moveTask {
              0% { transform: translateY(0); }
              20% { transform: translateY(10px); }
              40% { transform: translateY(20px); }
              60% { transform: translateY(30px); }
              80% { transform: translateY(40px); }
              100% { transform: translateY(0); opacity: 0; }
            }
            
            @keyframes growShrink {
              0% { transform: scale(0.8); }
              50% { transform: scale(1.1); }
              100% { transform: scale(0.8); }
            }
            
            .rotate-circle {
              animation: rotateCircle 3s linear infinite;
              transform-origin: center;
            }
            
            .rotate-reverse {
              animation: rotateCounterClockwise 4s linear infinite;
              transform-origin: center;
            }
            
            .dash-animate {
              animation: dashOffset 4s ease-in-out infinite;
            }
            
            .pulse-opacity {
              animation: pulseOpacity 2s ease-in-out infinite;
            }
            
            .move-task {
              animation: moveTask 3s ease-in-out infinite;
            }
            
            .grow-shrink {
              animation: growShrink 2s ease-in-out infinite;
            }
          `}</style>
        </defs>
        
        {/* Background circle */}
        <circle 
          cx="100" cy="100" r="90" 
          fill="#f5f7fa" 
          stroke="#e2e8f0" 
          strokeWidth="2"
        />
        
        {/* Rotating outer ring */}
        <g className="rotate-circle animated">
          <circle 
            cx="100" cy="100" r="80" 
            fill="none" 
            stroke={tertiaryColor} 
            strokeWidth="4"
            strokeDasharray="20 10"
          />
        </g>
        
        {/* Counter-rotating middle ring */}
        <g className="rotate-reverse animated">
          <circle 
            cx="100" cy="100" r="65" 
            fill="none" 
            stroke={secondaryColor} 
            strokeWidth="6"
            strokeDasharray="15 15"
          />
        </g>
        
        {/* Clipboard background */}
        <rect 
          x="60" y="50" width="80" height="100" rx="5" 
          fill="white" 
          stroke="#d1d5db" 
          strokeWidth="2"
          filter="url(#taskShadow)"
        />
        
        {/* Clipboard top */}
        <rect 
          x="85" y="42" width="30" height="16" rx="3" 
          fill="white" 
          stroke="#d1d5db" 
          strokeWidth="2"
        />
        
        {/* Task lines */}
        <line x1="70" y1="70" x2="130" y2="70" stroke="#e5e7eb" strokeWidth="2" />
        <line x1="70" y1="85" x2="130" y2="85" stroke="#e5e7eb" strokeWidth="2" />
        <line x1="70" y1="100" x2="130" y2="100" stroke="#e5e7eb" strokeWidth="2" />
        <line x1="70" y1="115" x2="130" y2="115" stroke="#e5e7eb" strokeWidth="2" />
        <line x1="70" y1="130" x2="130" y2="130" stroke="#e5e7eb" strokeWidth="2" />
        
        {/* Animating task items */}
        <g className="move-task animated">
          <circle cx="75" cy="70" r="3" fill={color} />
          <line x1="80" y1="70" x2="120" y2="70" stroke={color} strokeWidth="2" />
        </g>
        
        <g className="move-task animated random-delay">
          <circle cx="75" cy="85" r="3" fill={color} />
          <line x1="80" y1="85" x2="110" y2="85" stroke={color} strokeWidth="2" />
        </g>
        
        {/* Checkmarks that appear and disappear */}
        <path 
          d="M70,100 L75,105 L85,95" 
          fill="none" 
          stroke={color} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="pulse-opacity animated"
        />
        
        <path 
          d="M70,115 L75,120 L85,110" 
          fill="none" 
          stroke={color} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="pulse-opacity animated random-delay"
        />
        
        {/* Moving and growing progress bar */}
        <rect 
          x="90" y="130" width="35" height="6" rx="3" 
          fill={color}
          className="grow-shrink animated"
        />
        
        {/* Rotating progress indicator */}
        <circle 
          cx="100" cy="100" r="95" 
          fill="none" 
          stroke="url(#loadingGradient)" 
          strokeWidth="6"
          strokeDasharray="200 400"
          className="dash-animate animated"
          strokeLinecap="round"
        />
        
        {/* Small elements that add visual interest */}
        <circle 
          cx="140" cy="55" r="8" 
          fill={secondaryColor}
          className="pulse-opacity animated random-delay" 
        />
        
        <circle 
          cx="60" cy="140" r="8" 
          fill={secondaryColor}
          className="pulse-opacity animated random-delay" 
        />
        
        {/* Progress percentage in center */}
        <g className="pulse-opacity animated" style={{ opacity: 0.8 }}>
          <circle cx="100" cy="165" r="15" fill={color} />
          <text 
            x="100" y="170" 
            textAnchor="middle" 
            fill="white" 
            fontSize="12"
            fontWeight="bold"
          >
            %
          </text>
        </g>
      </svg>
    </div>
  );
};

export default TaskSpinner;