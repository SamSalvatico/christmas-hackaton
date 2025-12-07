'use client';

import { christmasColors } from '@/lib/utils/christmas-theme';

interface ChristmasSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ChristmasSpinner({
  message = 'Santa is searching for Christmas traditions...',
  size = 'lg',
}: ChristmasSpinnerProps) {
  const displayMessage =
    message || 'Santa is searching for Christmas traditions...';

  /** Map your size prop → actual pixel width */
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160,
  };

  const iconSize = sizeMap[size] ?? 140;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <SantaSled size={iconSize} />

      <p
        className="text-center text-gray-700 font-medium"
        style={{ color: christmasColors.darkGreen }}
      >
        {displayMessage}
      </p>
    </div>
  );
}

/* --- Santa SVG Component --- */

function SantaSled({ size = 160 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size * 0.6,
        lineHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        position: 'relative',
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes sled-slide {
          0% { transform: translateX(-10px); }
          100% { transform: translateX(10px); }
        }

        @keyframes santa-bob {
          0% { transform: translateY(0px) rotate(-2deg); }
          100% { transform: translateY(-4px) rotate(2deg); }
        }

        .sled-wrap {
          animation: sled-slide 2s ease-in-out infinite alternate;
          will-change: transform;
        }

        .santa-group {
          animation: santa-bob 0.8s ease-in-out infinite alternate;
          transform-origin: 50% 50%;
        }

        .sled-shadow {
          opacity: 0.25;
          filter: blur(2px);
        }
      `}</style>

      <svg
        viewBox="-70 -15 250 170"
        width={size}
        height={size * 0.6}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}
      >
        <ellipse
          cx="100"
          cy="100"
          rx="36"
          ry="6"
          fill="#0b1221"
          className="sled-shadow"
        />

        <g className="sled-wrap" transform="translate(40,30)">
          <g transform="translate(0,48)">
            <rect x="6" y="0" width="120" height="12" rx="4" fill="#8b3e21" />
            <rect x="18" y="-6" width="84" height="10" rx="4" fill="#b65a2b" />

            <path
              d="M2 12 C18 22, 46 22, 62 12"
              stroke="#3b2a1a"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M76 12 C92 22, 120 22, 136 12"
              stroke="#3b2a1a"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          <g className="santa-group" transform="translate(84,6)">
            <path
              d="M-18 44 C-34 36, -36 16, -18 8 C2 0, 18 10, 8 34 C2 46, -2 52, -18 44 Z"
              fill="#7a2b1b"
            />

            <g transform="translate(0,10)">
              <ellipse cx="0" cy="18" rx="18" ry="14" fill="#d6342a" />
              <rect
                x="-12"
                y="16"
                width="24"
                height="6"
                fill="#1f1f1f"
                rx="1"
              />
              <rect x="-2" y="16" width="4" height="6" fill="#f3d86b" />
            </g>

            <g transform="translate(0, -6)">
              <circle cx="0" cy="0" r="10" fill="#ffd9c7" />

              <path
                d="M-10 6 C-6 18, 6 18, 10 6 C6 18, -6 18, -10 6 Z"
                fill="#fff"
              />

              <path d="M-12 -6 C-8 -20, 12 -18, 14 -6 Z" fill="#d6342a" />
              <circle cx="14" cy="-6" r="3" fill="#fff" />

              <circle cx="0" cy="1" r="2" fill="#ffb199" />
              <circle cx="-3" cy="-1" r="1" fill="#1b1b1b" />
              <circle cx="3" cy="-1" r="1" fill="#1b1b1b" />
            </g>

            <path
              d="M-4 28 C-10 34, -24 38, -36 40"
              stroke="#8b3e21"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
