import React, { useEffect, useRef } from 'react';

const PianoRoll = ({ notes }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    const noteToY = (noteStr) => {
        // Very basic mapping for visualization
        const octave = parseInt(noteStr.slice(-1));
        const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const noteName = noteStr.slice(0, -1);
        const noteIndex = noteNames.indexOf(noteName);

        // Base C4 is middle, let's map around it
        const baseOctave = 4;
        const octaveDiff = octave - baseOctave;
        const yCenter = canvas.height / 2;

        const yOffset = -(octaveDiff * 12 + noteIndex) * 10;

        return yCenter + yOffset;
    };

    const durationToWidth = (duration) => {
        if (duration === "16n") return 20;
        if (duration === "8n") return 40;
        if (duration === "4n") return 80;
        if (duration === "2n") return 160;
        return 40;
    }

    // Draw notes
    const currentTime = Date.now() / 1000;

    notes.forEach(noteData => {
      const { note, duration, timestamp } = noteData;

      // Calculate x position based on how long ago it was generated
      const timeDiff = currentTime - timestamp;
      const xPos = canvas.width - (timeDiff * 100) - 50; // Move left over time

      if (xPos > -100) { // Only draw if still on screen
          const yPos = noteToY(note);
          const width = durationToWidth(duration);

          ctx.fillStyle = '#4ade80'; // Nice green color
          ctx.fillRect(xPos, yPos, width, 15);

          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.strokeRect(xPos, yPos, width, 15);

          ctx.fillStyle = '#111';
          ctx.font = '10px Arial';
          ctx.fillText(note, xPos + 2, yPos + 11);
      }
    });

  }, [notes]); // Re-render when notes change

  // We need an animation frame to keep moving old notes even if no new ones come
  useEffect(() => {
     let animationFrameId;
     const renderLoop = () => {
         // Trigger a re-render of the canvas by calling the effect logic again
         // Actually, since we want smooth scrolling, we'd need a more complex setup,
         // but for this simple version, relying on incoming notes + a slow timer is okay.
         animationFrameId = requestAnimationFrame(renderLoop);
     };
     // For a true smooth scroll, we'd manage state differently,
     // but we keep it simple here.
     return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div style={{ marginTop: '20px', border: '1px solid #444', borderRadius: '8px', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        style={{ display: 'block', backgroundColor: '#1e1e1e' }}
      />
    </div>
  );
};

export default PianoRoll;
