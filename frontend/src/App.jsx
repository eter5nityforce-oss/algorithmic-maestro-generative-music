import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import PianoRoll from './PianoRoll';
import Controls from './Controls';
import Waveform from './Waveform';
import './App.css';

function App() {
  const [params, setParams] = useState(null);
  const [availableScales, setAvailableScales] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [analyzer, setAnalyzer] = useState(null);
  const ws = useRef(null);
  const synth = useRef(null);

  useEffect(() => {
    // Fetch initial parameters to get available scales
    fetch('/api/parameters')
      .then(res => res.json())
      .then(data => {
        setAvailableScales(data.scales);
        setParams({
          tempo: data.tempo,
          scale: data.scale,
          complexity: data.complexity
        });
      })
      .catch(err => console.error("Error fetching initial params:", err));

    // Initialize Tone.js synth and analyzer
    const newAnalyzer = new Tone.Waveform(512);
    setAnalyzer(newAnalyzer);

    synth.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "sine"
      },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 0.8
      }
    }).connect(newAnalyzer).toDestination();

    // Determine WebSocket URL (handling local dev vs production)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // For local dev, Vite runs on a different port than FastAPI.
    // We assume backend is on 8000 when running locally, or same host in prod.
    const wsUrl = process.env.NODE_ENV === 'development'
      ? `ws://localhost:8000/ws`
      : `${protocol}//${host}/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'params') {
        setParams(data.params);
      } else if (data.type === 'note') {
        // Play the note
        if (synth.current && Tone.context.state === 'running') {
            synth.current.triggerAttackRelease(data.note, data.duration);
        }

        // Add note to state for visualization (keep last 50)
        setNotes(prevNotes => {
          const newNotes = [...prevNotes, data].slice(-50);
          return newNotes;
        });
      }
    };

    ws.current.onclose = () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    };

    return () => {
      if (ws.current) ws.current.close();
      if (synth.current) synth.current.dispose();
    };
  }, []);

  // Update backend when params change via UI
  const handleParamChange = (newParams) => {
    setParams(newParams);

    // Determine API URL
    const apiUrl = process.env.NODE_ENV === 'development'
      ? `http://localhost:8000/api/parameters`
      : `/api/parameters`;

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newParams),
    }).catch(err => console.error("Error updating params:", err));
  };

  const startAudio = async () => {
    await Tone.start();
    console.log('Audio is ready');
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1>알고리즘 마에스트로</h1>
        <p>실시간 생성 음악 환경 (Real-time Generative Music Environment)</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
            <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#4ade80' : '#ef4444'
            }}></div>
            <span>{isConnected ? "Connected to Engine" : "Disconnected"}</span>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
             <button
                onClick={startAudio}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Start Audio (Required by Browser)
            </button>
        </div>

        {params && (
          <Controls
            params={params}
            onParamChange={handleParamChange}
            availableScales={availableScales}
            notes={notes}
          />
        )}

        {analyzer && <Waveform analyzer={analyzer} />}
        <PianoRoll notes={notes} />
      </main>
    </div>
  );
}

export default App;
