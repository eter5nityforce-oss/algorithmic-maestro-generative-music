import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';

const Waveform = ({ analyzer }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyzer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      const values = analyzer.getValue();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6'; // Blue color for waveform
      ctx.lineWidth = 2;

      for (let i = 0; i < values.length; i++) {
        const x = (i / values.length) * canvas.width;
        // The values are typically between -1 and 1
        const y = ((values[i] + 1) / 2) * canvas.height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    renderLoop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [analyzer]);

  return (
    <div style={{ marginTop: '20px', border: '1px solid #444', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '5px', backgroundColor: '#333', color: '#ccc', fontSize: '12px' }}>Waveform Display</div>
      <canvas
        ref={canvasRef}
        width={800}
        height={100}
        style={{ display: 'block', backgroundColor: '#1e1e1e' }}
      />
    </div>
  );
};

export default Waveform;
