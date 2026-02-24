
import React, { useRef, useEffect, useState } from 'react';

interface BodyMapProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
}

const BodyMap: React.FC<BodyMapProps> = ({ onSave, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial canvas background with a simple human figure outline
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple human outline (stick figure)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(150, 50, 30, 0, Math.PI * 2); // Head
    ctx.moveTo(150, 80); ctx.lineTo(150, 250); // Body
    ctx.moveTo(150, 120); ctx.lineTo(80, 180); // Left Arm
    ctx.moveTo(150, 120); ctx.lineTo(220, 180); // Right Arm
    ctx.moveTo(150, 250); ctx.lineTo(100, 350); // Left Leg
    ctx.moveTo(150, 250); ctx.lineTo(200, 350); // Right Leg
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 8;
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw outline
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(150, 50, 30, 0, Math.PI * 2);
    ctx.moveTo(150, 80); ctx.lineTo(150, 250);
    ctx.moveTo(150, 120); ctx.lineTo(80, 180);
    ctx.moveTo(150, 120); ctx.lineTo(220, 180);
    ctx.moveTo(150, 250); ctx.lineTo(100, 350);
    ctx.moveTo(150, 250); ctx.lineTo(200, 350);
    ctx.stroke();
    ctx.strokeStyle = '#ef4444';
    onClear();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative border-4 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          width={300}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none cursor-crosshair"
        />
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold pointer-events-none">
          DRAW WHERE IT HURTS
        </div>
      </div>
      <button 
        onClick={handleClear}
        className="text-slate-500 font-semibold flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg"
      >
        <i className="fa-solid fa-rotate-left"></i> Start Over
      </button>
    </div>
  );
};

export default BodyMap;
