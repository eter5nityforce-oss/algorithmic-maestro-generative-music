import React, { useState, useEffect } from 'react';

const Controls = ({ params, onParamChange, availableScales, notes }) => {
  const [localParams, setLocalParams] = useState(params);

  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  const handleMutate = () => {
    const apiUrl = process.env.NODE_ENV === 'development'
      ? `http://localhost:8000/api/mutate`
      : `/api/mutate`;

    fetch(apiUrl, { method: 'POST' })
      .catch(err => console.error("Error triggering mutation:", err));
  };

  const handleSave = () => {
    if (!notes || notes.length === 0) {
      alert("No notes to save yet!");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "generated_composition.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    if (name === 'tempo' || name === 'complexity') {
        parsedValue = parseInt(value, 10);
    }

    const newParams = { ...localParams, [name]: parsedValue };
    setLocalParams(newParams);
    onParamChange(newParams);
  };

  if (!localParams) return <div>Loading controls...</div>;

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      padding: '20px',
      backgroundColor: '#2a2a2a',
      borderRadius: '8px',
      marginTop: '20px',
      color: 'white'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label htmlFor="tempo">Tempo ({localParams.tempo || 120} BPM)</label>
        <input
          type="range"
          id="tempo"
          name="tempo"
          min="60"
          max="200"
          value={localParams.tempo || 120}
          onChange={handleChange}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label htmlFor="complexity">Complexity ({localParams.complexity || 5})</label>
        <input
          type="range"
          id="complexity"
          name="complexity"
          min="1"
          max="10"
          value={localParams.complexity || 5}
          onChange={handleChange}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label htmlFor="scale">Scale/Mood</label>
        <select
          id="scale"
          name="scale"
          value={localParams.scale || "C_major"}
          onChange={handleChange}
          style={{ padding: '5px', borderRadius: '4px' }}
        >
          {availableScales.map(scale => (
            <option key={scale} value={scale}>{scale.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleMutate}
          style={{ padding: '8px 15px', backgroundColor: '#eab308', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Mutate!
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          style={{ padding: '8px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Save (JSON)
        </button>
      </div>

    </div>
  );
};

export default Controls;
