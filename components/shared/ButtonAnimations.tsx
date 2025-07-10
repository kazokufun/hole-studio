import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { playAudio } from '../../services/audioService';

interface ButtonAnimationsProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const ButtonAnimations: React.FC<ButtonAnimationsProps> = ({ children, onClick, disabled, className = '' }) => {
  const blueRectsRef = useRef<SVGRectElement[]>([]);
  const pinkRectsRef = useRef<SVGRectElement[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || (timelineRef.current && timelineRef.current.isActive())) {
      e.preventDefault();
      return;
    }
    
    playAudio('/tombol.mp3');

    // Create a new timeline on each click
    const tl = gsap.timeline({
        onComplete: () => {
           // Ensure GSAP doesn't hold references unnecessarily
           tl.kill(); 
        }
    });
    timelineRef.current = tl;

    // Set initial positions
    tl.set(blueRectsRef.current, { xPercent: 101 })
      .set(pinkRectsRef.current, { xPercent: -101 });

    // Animate in
    tl.to(blueRectsRef.current, {
        xPercent: -101,
        duration: 0.5,
        ease: "power2.in",
        stagger: 0.02,
      }, 0)
      .to(pinkRectsRef.current, {
        xPercent: 101,
        duration: 0.5,
        ease: "power2.in",
        stagger: 0.02,
      }, 0);

    // Animate out
    tl.to(blueRectsRef.current, {
        xPercent: -202,
        duration: 0.5,
        ease: "power2.out",
        stagger: {
          each: 0.02,
          from: "end"
        }
    }, ">-0.1")
    .to(pinkRectsRef.current, {
        xPercent: 202,
        duration: 0.5,
        ease: "power2.out",
        stagger: {
          each: 0.02,
          from: "end"
        }
    }, "<");
    
    onClick();
  };

  const css = `
    .animated-btn {
      color: #22d3ee; /* Neon Blue */
      cursor: pointer;
      display: flex;
      font-weight: 500;
      font-style: italic;
      align-items: center;
      justify-content: center;
      font-family: "IBM Plex Mono", monospace;
      height: 40px;
      padding: 0 24px;
      position: relative;
      border: none;
      background: transparent;
      transition: all 700ms;
      min-width: 160px;
      letter-spacing: 0.05em;
    }
    .animated-btn:disabled {
      cursor: not-allowed;
      color: #888;
    }
    .animated-btn::before {
      background-color: #24252c;
      background-image: repeating-linear-gradient(
        0deg,
        #181a29,
        #181a29 1px,
        #202436 1px,
        #202436 2px
      );
      border-radius: 10px;
      content: "";
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      overflow: hidden;
      transform: skew(-15deg);
      transition: box-shadow 700ms;
      width: 100%;
      z-index: -1;
    }
    .animated-btn:not(:disabled):hover::before, .animated-btn:focus::before {
      box-shadow: 0 0 25px 2px #0763f7;
    }
    .animated-btn:disabled::before {
      background-color: #4a4b53;
      background-image: repeating-linear-gradient(0deg, #3a3b43, #3a3b43 1px, #4a4b53 1px, #4a4b53 2px);
    }
    .animated-btn-span {
      transition: color 350ms;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .animated-btn-svg {
      border-radius: 10px;
      overflow: hidden;
      position: absolute;
      transform: skew(-15deg);
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }
    .animated-btn-svg .blue rect {
      fill: #05eafa;
      shape-rendering: crispEdges;
      mix-blend-mode: color-dodge;
    }
    .animated-btn-svg .pink rect {
      fill: #ff6bd3;
      shape-rendering: crispEdges;
    }
  `;

  const rects = Array.from({ length: 10 }, (_, i) => (
    <rect key={i} y={i * 4} width="100%" height="4" />
  ));

  return (
    <>
      <style>{css}</style>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`animated-btn ${className}`}
      >
        <span className="animated-btn-span">{children}</span>
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg" className="animated-btn-svg">
          <g className="pink">
            {rects.map((rect, i) => React.cloneElement(rect, {
              x: "-101%",
              ref: (el: SVGRectElement | null) => { if (el) pinkRectsRef.current[i] = el; }
            }))}
          </g>
          <g className="blue">
            {rects.map((rect, i) => React.cloneElement(rect, {
              x: "101%",
              ref: (el: SVGRectElement | null) => { if (el) blueRectsRef.current[i] = el; }
            }))}
          </g>
        </svg>
      </button>
    </>
  );
};