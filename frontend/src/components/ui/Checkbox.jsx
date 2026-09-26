import React from 'react';
import styled from 'styled-components';

const Checkbox = ({
  checked = false,
  onChange,
  label,
  id,
  name,
  disabled = false,
  size = '20px',
  className = '',
  ...props
}) => {
  return (
    <StyledWrapper $size={typeof size === 'number' ? `${size}px` : size} className={className}>
      <label className={`neon-checkbox ${disabled ? 'disabled' : ''}`}>
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        <div className="neon-checkbox__frame">
          <div className="neon-checkbox__box">
            <div className="neon-checkbox__check-container">
              <svg viewBox="0 0 24 24" className="neon-checkbox__check">
                <path d="M3,12.5l7,7L21,5" />
              </svg>
            </div>
            <div className="neon-checkbox__glow" />
            <div className="neon-checkbox__borders">
              <span /><span /><span /><span />
            </div>
          </div>
          <div className="neon-checkbox__effects">
            <div className="neon-checkbox__particles">
              <span /><span /><span /><span /> <span /><span /><span /><span /> <span /><span /><span /><span />
            </div>
            <div className="neon-checkbox__rings">
              <div className="ring" />
              <div className="ring" />
              <div className="ring" />
            </div>
            <div className="neon-checkbox__sparks">
              <span /><span /><span /><span />
            </div>
          </div>
        </div>
        {label && <span className="neon-checkbox__label">{label}</span>}
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;

  .neon-checkbox {
    --primary: #4f46e5;
    --primary-dark: #3730a3;
    --primary-light: #a5b4fc;
    --primary-glow: rgba(79, 70, 229, 0.4);
    --box-bg: #f5f2ff;
    --box-border: #c7c4d8;
    --box-hover-border: #4f46e5;
    --size: ${props => props.$size || '20px'};
    
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Dark mode theme adaptation */
  :global(.dark) .neon-checkbox,
  .dark .neon-checkbox {
    --primary: #818cf8;
    --primary-dark: #6366f1;
    --primary-light: #c7d2fe;
    --primary-glow: rgba(129, 140, 248, 0.5);
    --box-bg: #1e293b;
    --box-border: #475569;
    --box-hover-border: #818cf8;
  }

  .neon-checkbox.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .neon-checkbox input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
    pointer-events: none;
  }

  .neon-checkbox__frame {
    position: relative;
    width: var(--size);
    height: var(--size);
    flex-shrink: 0;
  }

  .neon-checkbox__box {
    position: absolute;
    inset: 0;
    background: var(--box-bg);
    border-radius: 6px;
    border: 1.5px solid var(--box-border);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .neon-checkbox__check-container {
    position: absolute;
    inset: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .neon-checkbox__check {
    width: 85%;
    height: 85%;
    fill: none;
    stroke: var(--primary);
    stroke-width: 3.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 40;
    stroke-dashoffset: 40;
    transform-origin: center;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .neon-checkbox__glow {
    position: absolute;
    inset: -2px;
    border-radius: 8px;
    background: var(--primary);
    opacity: 0;
    filter: blur(6px);
    transform: scale(1.1);
    transition: all 0.4s ease;
    z-index: 0;
  }

  .neon-checkbox__borders {
    position: absolute;
    inset: 0;
    border-radius: 5px;
    overflow: hidden;
    z-index: 1;
  }

  .neon-checkbox__borders span {
    position: absolute;
    width: 40px;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, var(--primary), transparent);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .neon-checkbox__borders span:nth-child(1) {
    top: 0;
    left: -100%;
    animation: borderFlow1 2s linear infinite;
  }

  .neon-checkbox__borders span:nth-child(2) {
    top: -100%;
    right: 0;
    width: 1.5px;
    height: 40px;
    animation: borderFlow2 2s linear infinite;
  }

  .neon-checkbox__borders span:nth-child(3) {
    bottom: 0;
    right: -100%;
    animation: borderFlow3 2s linear infinite;
  }

  .neon-checkbox__borders span:nth-child(4) {
    bottom: -100%;
    left: 0;
    width: 1.5px;
    height: 40px;
    animation: borderFlow4 2s linear infinite;
  }

  .neon-checkbox__effects {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .neon-checkbox__particles span {
    position: absolute;
    width: 3.5px;
    height: 3.5px;
    background: var(--primary);
    border-radius: 50%;
    opacity: 0;
    pointer-events: none;
    top: 50%;
    left: 50%;
    box-shadow: 0 0 6px var(--primary);
  }

  .neon-checkbox__rings {
    position: absolute;
    inset: -14px;
    pointer-events: none;
  }

  .neon-checkbox__rings .ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid var(--primary);
    opacity: 0;
    transform: scale(0);
  }

  .neon-checkbox__sparks span {
    position: absolute;
    width: 14px;
    height: 1.5px;
    background: linear-gradient(90deg, var(--primary), transparent);
    opacity: 0;
  }

  .neon-checkbox__label {
    font-size: 14px;
    color: inherit;
    transition: color 0.2s ease;
  }

  /* Hover Effects */
  .neon-checkbox:hover .neon-checkbox__box {
    border-color: var(--box-hover-border);
    transform: scale(1.05);
  }

  /* Checked State */
  .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__box {
    border-color: var(--primary);
    background: rgba(79, 70, 229, 0.12);
  }

  :global(.dark) .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__box,
  .dark .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__box {
    background: rgba(129, 140, 248, 0.18);
  }

  .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__check {
    stroke-dashoffset: 0;
    transform: scale(1.05);
  }

  .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__glow {
    opacity: 0.28;
  }

  .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__borders span {
    opacity: 1;
  }

  /* Particle Animations */
  .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__particles span {
    animation: particleExplosion 0.6s ease-out forwards;
  }

  .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__rings .ring {
    animation: ringPulse 0.6s ease-out forwards;
  }

  .neon-checkbox input:checked ~ .neon-checkbox__frame .neon-checkbox__sparks span {
    animation: sparkFlash 0.6s ease-out forwards;
  }

  /* Keyframe Animations */
  @keyframes borderFlow1 {
    0% { transform: translateX(0); }
    100% { transform: translateX(200%); }
  }

  @keyframes borderFlow2 {
    0% { transform: translateY(0); }
    100% { transform: translateY(200%); }
  }

  @keyframes borderFlow3 {
    0% { transform: translateX(0); }
    100% { transform: translateX(-200%); }
  }

  @keyframes borderFlow4 {
    0% { transform: translateY(0); }
    100% { transform: translateY(-200%); }
  }

  @keyframes particleExplosion {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      transform: translate(
          calc(-50% + var(--x, 18px)),
          calc(-50% + var(--y, 18px))
        )
        scale(0);
      opacity: 0;
    }
  }

  @keyframes ringPulse {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1.8);
      opacity: 0;
    }
  }

  @keyframes sparkFlash {
    0% {
      transform: rotate(var(--r, 0deg)) translateX(0) scale(1);
      opacity: 1;
    }
    100% {
      transform: rotate(var(--r, 0deg)) translateX(22px) scale(0);
      opacity: 0;
    }
  }

  /* Particle Positions */
  .neon-checkbox__particles span:nth-child(1) { --x: 18px; --y: -18px; }
  .neon-checkbox__particles span:nth-child(2) { --x: -18px; --y: -18px; }
  .neon-checkbox__particles span:nth-child(3) { --x: 18px; --y: 18px; }
  .neon-checkbox__particles span:nth-child(4) { --x: -18px; --y: 18px; }
  .neon-checkbox__particles span:nth-child(5) { --x: 24px; --y: 0px; }
  .neon-checkbox__particles span:nth-child(6) { --x: -24px; --y: 0px; }
  .neon-checkbox__particles span:nth-child(7) { --x: 0px; --y: 24px; }
  .neon-checkbox__particles span:nth-child(8) { --x: 0px; --y: -24px; }
  .neon-checkbox__particles span:nth-child(9) { --x: 15px; --y: -22px; }
  .neon-checkbox__particles span:nth-child(10) { --x: -15px; --y: 22px; }
  .neon-checkbox__particles span:nth-child(11) { --x: 22px; --y: 15px; }
  .neon-checkbox__particles span:nth-child(12) { --x: -22px; --y: -15px; }

  /* Spark Rotations */
  .neon-checkbox__sparks span:nth-child(1) { --r: 0deg; top: 50%; left: 50%; }
  .neon-checkbox__sparks span:nth-child(2) { --r: 90deg; top: 50%; left: 50%; }
  .neon-checkbox__sparks span:nth-child(3) { --r: 180deg; top: 50%; left: 50%; }
  .neon-checkbox__sparks span:nth-child(4) { --r: 270deg; top: 50%; left: 50%; }

  /* Ring Delays */
  .neon-checkbox__rings .ring:nth-child(1) { animation-delay: 0s; }
  .neon-checkbox__rings .ring:nth-child(2) { animation-delay: 0.1s; }
  .neon-checkbox__rings .ring:nth-child(3) { animation-delay: 0.2s; }
`;

export default Checkbox;
