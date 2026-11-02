import React, { useEffect, useRef } from 'react';

interface ArcReactorCoreProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  isSpeaking,
  isListening,
  isThinking,
  onClick,
  size = 'md',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const dimension = size === 'sm' ? 120 : size === 'lg' ? 240 : 180;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, dimension, dimension);
      const centerX = dimension / 2;
      const centerY = dimension / 2;
      const baseRadius = dimension * 0.38;

      angle += isThinking ? 0.08 : isSpeaking ? 0.05 : 0.015;
      pulse += isSpeaking ? 0.12 : isListening ? 0.18 : 0.04;

      const dynamicRadius = baseRadius + Math.sin(pulse) * (isSpeaking ? 5 : isListening ? 7 : 2);

      // Color scheme based on state
      const primaryColor = isListening
        ? 'rgba(239, 68, 68, ' // Red listening
        : isThinking
        ? 'rgba(245, 158, 11, ' // Amber thinking
        : isSpeaking
        ? 'rgba(0, 242, 254, ' // Cyan speaking
        : 'rgba(56, 189, 248, '; // Calm Sky Blue idle

      // Outer glow circle
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        dynamicRadius * 0.2,
        centerX,
        centerY,
        dynamicRadius * 1.3
      );
      gradient.addColorStop(0, primaryColor + '0.8)');
      gradient.addColorStop(0.5, primaryColor + '0.2)');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Outer segmented ring
      ctx.strokeStyle = primaryColor + '0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius * 1.05, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating dashed ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.strokeStyle = primaryColor + '0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, dynamicRadius * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Counter rotating inner ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angle * 1.4);
      ctx.strokeStyle = primaryColor + '0.9)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, dynamicRadius * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Central core node
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        dynamicRadius * 0.45
      );
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.3, primaryColor + '1)');
      coreGradient.addColorStop(1, primaryColor + '0.1)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Geometric triangle / hex tech accents
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      const polyRadius = dynamicRadius * 0.35;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const rad = (i * Math.PI) / 3;
        const x = Math.cos(rad) * polyRadius;
        const y = Math.sin(rad) * polyRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimension, isSpeaking, isListening, isThinking]);

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center justify-center cursor-pointer group select-none"
      title="Cliquer pour interagir vocalement avec JARVIS"
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={dimension}
          height={dimension}
          className="relative z-10 transition-transform duration-300 group-hover:scale-105"
        />

        {/* Ambient pulse halo */}
        <div
          className={`absolute inset-0 rounded-full blur-xl pointer-events-none transition-opacity duration-500 ${
            isListening
              ? 'bg-red-500/30 opacity-90'
              : isThinking
              ? 'bg-amber-500/30 opacity-90'
              : isSpeaking
              ? 'bg-cyan-400/30 opacity-90'
              : 'bg-cyan-500/15 opacity-40 group-hover:opacity-70'
          }`}
        />
      </div>

      {/* State label */}
      <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-hud">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            isListening
              ? 'bg-red-500 animate-ping'
              : isThinking
              ? 'bg-amber-400 animate-pulse'
              : isSpeaking
              ? 'bg-cyan-400 animate-pulse'
              : 'bg-emerald-400'
          }`}
        />
        <span className="text-cyan-300 uppercase tracking-widest font-semibold text-[11px]">
          {isListening
            ? 'Écoute en cours...'
            : isThinking
            ? 'Analyse IA...'
            : isSpeaking
            ? 'JARVIS parle'
            : 'En veille active'}
        </span>
      </div>
    </div>
  );
};
