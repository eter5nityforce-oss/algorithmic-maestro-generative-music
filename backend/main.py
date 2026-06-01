from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import os

from engine import MusicEngine

app = FastAPI(title="알고리즘 마에스트로: 실시간 생성 음악 환경")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Convert dict to JSON string if needed, but send_json handles dicts
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending message: {e}")
                self.disconnect(connection)

manager = ConnectionManager()
engine = MusicEngine()

# Background task for the engine
engine_task = None

@app.on_event("startup")
async def startup_event():
    global engine_task
    # Start the engine generating loop
    engine_task = asyncio.create_task(engine.generate_loop(manager.broadcast))

@app.on_event("shutdown")
async def shutdown_event():
    engine.stop()
    if engine_task:
        engine_task.cancel()

class ParamsUpdate(BaseModel):
    tempo: int = None
    scale: str = None
    complexity: int = None

@app.post("/api/parameters")
async def update_parameters(params: ParamsUpdate):
    update_dict = params.dict(exclude_unset=True)
    engine.update_params(update_dict)

    # Broadcast param change to all clients
    await manager.broadcast({
        "type": "params",
        "params": {
            "tempo": engine.tempo,
            "scale": engine.scale,
            "complexity": engine.complexity
        }
    })
    return {"status": "success", "params": update_dict}

@app.get("/api/parameters")
async def get_parameters():
    return {
        "tempo": engine.tempo,
        "scale": engine.scale,
        "complexity": engine.complexity,
        "scales": list(engine.scales.keys())
    }

@app.post("/api/mutate")
async def trigger_mutation():
    engine.trigger_mutate()
    return {"status": "success", "message": "Mutation triggered"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send current params on connect
    await websocket.send_json({
        "type": "params",
        "params": {
            "tempo": engine.tempo,
            "scale": engine.scale,
            "complexity": engine.complexity
        }
    })

    try:
        while True:
            # Keep connection open, handle any incoming messages from client
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Clients can optionally send param updates via WS too
                if message.get("type") == "update_params":
                    engine.update_params(message.get("params", {}))
                    await manager.broadcast({
                        "type": "params",
                        "params": {
                            "tempo": engine.tempo,
                            "scale": engine.scale,
                            "complexity": engine.complexity
                        }
                    })
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Serve the static files from frontend build
# This will be mounted after API routes to ensure API routes take precedence
@app.on_event("startup")
def mount_static():
    dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
    if os.path.exists(dist_path):
        app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")
