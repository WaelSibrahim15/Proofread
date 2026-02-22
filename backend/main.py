import asyncio
import os
import signal
import subprocess
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

LT_PORT = 8081
LT_BASE = f"http://127.0.0.1:{LT_PORT}"
APP_PORT = int(os.getenv("PORT", "8002"))

BACKEND_DIR = Path(__file__).parent
REPO_DIR = BACKEND_DIR.parent
LT_JAR = REPO_DIR / "languagetool" / "LanguageTool-6.6" / "languagetool-server.jar"
FRONTEND_DIST = REPO_DIR / "frontend" / "dist"

_lt_process: subprocess.Popen | None = None


async def _wait_for_lt(timeout: float = 60.0) -> None:
    deadline = asyncio.get_event_loop().time() + timeout
    async with httpx.AsyncClient(timeout=3.0) as client:
        while asyncio.get_event_loop().time() < deadline:
            try:
                r = await client.get(f"{LT_BASE}/v2/languages")
                if r.status_code == 200:
                    return
            except Exception:
                pass
            await asyncio.sleep(1.0)
    raise RuntimeError("LanguageTool server did not start in time.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _lt_process
    if not LT_JAR.exists():
        print(f"[ERROR] LanguageTool JAR not found at {LT_JAR}", file=sys.stderr)
    else:
        print(f"[INFO] Starting LanguageTool on port {LT_PORT}…")
        _lt_process = subprocess.Popen(
            [
                "java",
                "-cp", str(LT_JAR),
                "org.languagetool.server.HTTPServer",
                "--port", str(LT_PORT),
                "--allow-origin", "*",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        try:
            await _wait_for_lt()
            print("[INFO] LanguageTool is ready.")
        except RuntimeError as exc:
            print(f"[WARN] {exc}", file=sys.stderr)

    yield

    if _lt_process is not None:
        print("[INFO] Stopping LanguageTool…")
        _lt_process.send_signal(signal.SIGTERM)
        try:
            _lt_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            _lt_process.kill()


app = FastAPI(title="Eloquent API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5177",
        "http://127.0.0.1:5177",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8002",
        "http://127.0.0.1:8002",
        "null",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CheckRequest(BaseModel):
    text: str
    language: str = "en-US"
    enabledOnly: bool = False


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/languages")
async def languages() -> Any:
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            r = await client.get(f"{LT_BASE}/v2/languages")
            r.raise_for_status()
            return r.json()
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"LanguageTool unavailable: {exc}")


@app.post("/api/check")
async def check(req: CheckRequest) -> Any:
    if not req.text.strip():
        return {"matches": [], "language": {"name": req.language, "code": req.language}}

    params = {"text": req.text, "language": req.language}
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            r = await client.post(f"{LT_BASE}/v2/check", data=params)
            r.raise_for_status()
            return r.json()
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"LanguageTool error: {exc}")


# Serve built frontend
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets"), html=False), name="assets")

    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        return FileResponse(str(FRONTEND_DIST / "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=APP_PORT, reload=True)
