'use client';

import { christmasColors } from '@/lib/utils/christmas-theme';

interface BaubleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay?: number;
}

function ChristmasBauble({ x, y, size, color, delay = 0 }: BaubleProps) {
  const delayId = Math.round(delay * 10); // Convert to integer for CSS class name
  return (
    <g transform={`translate(${x}, ${y})`}>
      <style>{`
        @keyframes bauble-sway-${delayId} {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        
        .bauble-${delayId} {
          animation: bauble-sway-${delayId} ${3 + delay * 0.5}s ease-in-out infinite;
          animation-delay: ${delay * 0.2}s;
          transform-origin: ${size / 2}px ${size / 2}px;
        }
      `}</style>
      <g className={`bauble-${delayId}`}>
        {/* Bauble body */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2.5}
          fill={color}
          opacity={0.15}
        />
        {/* Highlight */}
        <circle
          cx={size / 2 - size / 8}
          cy={size / 2 - size / 6}
          r={size / 8}
          fill="white"
          opacity={0.3}
        />
        {/* Top hook/cap */}
        <rect
          x={size / 2 - size / 12}
          y={size / 8}
          width={size / 6}
          height={size / 8}
          fill={color}
          opacity={0.2}
          rx={size / 24}
        />
        {/* String/hanger */}
        <line
          x1={size / 2}
          y1={0}
          x2={size / 2}
          y2={size / 8}
          stroke={color}
          strokeWidth={size / 40}
          opacity={0.2}
        />
      </g>
    </g>
  );
}

export function ChristmasBaublesBackground() {
  // Generate baubles at various positions (coordinates: x 0-100, y 0-200 for scrolling)
  const baubles: Array<{ x: number; y: number; size: number; color: string; delay: number }> = [
    // Top left area
    { x: 5, y: 8, size: 6, color: christmasColors.red, delay: 0 },
    { x: 12, y: 20, size: 8, color: christmasColors.green, delay: 1 },
    { x: 8, y: 35, size: 5, color: christmasColors.gold, delay: 2 },
    
    // Top right area
    { x: 85, y: 12, size: 7, color: christmasColors.red, delay: 0.5 },
    { x: 75, y: 28, size: 6.5, color: christmasColors.green, delay: 1.5 },
    { x: 88, y: 45, size: 5.5, color: christmasColors.gold, delay: 2.5 },
    
    // Middle left
    { x: 10, y: 60, size: 7.5, color: christmasColors.red, delay: 0.3 },
    { x: 15, y: 80, size: 6, color: christmasColors.green, delay: 1.2 },
    
    // Middle right
    { x: 82, y: 70, size: 7, color: christmasColors.gold, delay: 0.8 },
    { x: 90, y: 95, size: 6.5, color: christmasColors.red, delay: 1.8 },
    
    // Bottom left
    { x: 12, y: 120, size: 6, color: christmasColors.green, delay: 0.6 },
    { x: 20, y: 145, size: 8, color: christmasColors.gold, delay: 1.4 },
    
    // Bottom right
    { x: 80, y: 130, size: 7, color: christmasColors.red, delay: 0.9 },
    { x: 88, y: 165, size: 5.5, color: christmasColors.green, delay: 2.2 },
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 200"
        preserveAspectRatio="xMidYMin slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {baubles.map((bauble, index) => (
          <ChristmasBauble
            key={index}
            x={bauble.x}
            y={bauble.y}
            size={bauble.size}
            color={bauble.color}
            delay={bauble.delay}
          />
        ))}
      </svg>
    </div>
  );
}

