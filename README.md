# 알고리즘 마에스트로 (Algorithm Maestro)
## Real-time Generative Music Environment

This project is a highly sophisticated, AI-driven collaborative platform for real-time procedural music composition. Users can define high-level musical parameters such as genre, mood, instrumentation, rhythmic complexity, and harmonic progressions through an intuitive web interface.

The FastAPI backend powers a complex generative music engine that uses procedural generation and Markov chain-like algorithms to produce coherent, multi-track musical compositions in real-time. The system streams generated MIDI/audio note events to the browser using WebSockets, allowing users to experience immediate feedback as they adjust parameters.

The frontend is built with React (Vite) and features an interactive piano roll visualization, real-time controls, and leverages Tone.js for high-quality audio synthesis directly in the browser.

## Architecture

*   **Backend (FastAPI)**:
    *   Handles REST API requests for updating musical parameters (`/api/parameters`).
    *   Manages WebSocket connections (`/ws`) for real-time streaming of generated notes and parameter synchronization across multiple clients (enabling real-time collaboration).
    *   `MusicEngine`: The core algorithmic generator running in an asynchronous background task.
    *   Serves the static frontend build directly, making it easy to deploy as a single unit.
*   **Frontend (React/Vite)**:
    *   `App.jsx`: Main entry point handling WebSocket connections and Tone.js initialization.
    *   `Controls.jsx`: UI for adjusting Tempo, Complexity, and Scale/Mood. Changes are synced with the backend in real-time.
    *   `PianoRoll.jsx`: A custom HTML5 Canvas component that visually renders incoming note events flowing in real-time.
    *   `Tone.js`: Synthesizes the incoming note streams into audible music.

## Requirements

*   Node.js (v18+ recommended)
*   Python (3.10+ recommended)

## Demo & Local Run Instructions

Follow these step-by-step instructions to run the project locally.

### 1. Build the Frontend

First, you need to install the Node.js dependencies and build the static assets for the React frontend.

```bash
cd frontend
npm install
npm run build
cd ..
```

This will create a `frontend/dist` directory containing the optimized static files.

### 2. Set up the Backend

Install the required Python packages for the backend. It's recommended to use a virtual environment.

```bash
cd backend
# Optional: Create and activate a virtual environment
# python -m venv venv
# source venv/bin/activate  # On Windows use `venv\Scripts\activate`

pip install -r requirements.txt
```

### 3. Run the Server

Start the FastAPI backend using `uvicorn`. Since the backend is configured to serve the frontend static files, you only need to run this single server.

```bash
# Assuming you are in the 'backend' directory
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Experience the Platform

1.  Open your web browser and navigate to `http://localhost:8000`.
2.  Click the **"Start Audio (Required by Browser)"** button. Modern browsers require explicit user interaction to start the Web Audio API context.
3.  You should now hear the algorithmic music being generated in real-time!
4.  Watch the **Piano Roll** visualization as notes are streamed from the server.
5.  Adjust the **Tempo**, **Complexity**, and **Scale/Mood** controls. Notice how the generative engine adapts instantly.
6.  **Collaboration Test**: Open `http://localhost:8000` in a second browser window or tab. Changes made to the controls in one window will instantly update the engine and synchronize the parameters and note streams across all open windows.
