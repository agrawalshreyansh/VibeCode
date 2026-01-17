import logging
import os
import time
import json
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import httpx

# ---------------- CONFIG ----------------

API_KEY = os.getenv("OPENROUTER_API_KEY", "")
MODEL = "arcee-ai/trinity-mini:free"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NexusEngine")

app = FastAPI(title="Nexus Agentic Optimizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- REQUEST MODELS ----------------

class Message(BaseModel):
    role: str
    content: str

class OptimizeRequest(BaseModel):
    original_prompt: str
    focus_area: Optional[str] = "general"
    history: Optional[List[Message]] = []

# ---------------- TOOLS ----------------

def tool_pii_scrubber(text: str):
    patterns = {
        "email": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
        "phone_in": r'(\+91[\-\s]?)?[6-9]\d{9}',
        "aadhaar": r'\b\d{4}\s?\d{4}\s?\d{4}\b',
        "pan": r'\b[A-Z]{5}[0-9]{4}[A-Z]\b'
    }

    scrubbed = text
    pii_found = False

    for pattern in patterns.values():
        new = re.sub(pattern, "[REDACTED]", scrubbed)
        if new != scrubbed:
            pii_found = True
        scrubbed = new

    scrubbed = re.sub(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', "[NAME_REDACTED]", scrubbed)

    return scrubbed, pii_found


def tool_context_injector(text: str, focus: str):
    templates = {
        "coding": "ROLE: Senior Principal Software Engineer\nOBJECTIVE: Rewrite the prompt only\n\nRAW PROMPT:\n{text}",
        "academic": "ROLE: Research Scholar\nOBJECTIVE: Rewrite the prompt only\n\nRAW PROMPT:\n{text}",
        "creative": "ROLE: Best-Selling Author\nOBJECTIVE: Rewrite the prompt only\n\nRAW PROMPT:\n{text}",
        "general": "ROLE: Expert Assistant\nOBJECTIVE: Rewrite the prompt only\n\nRAW PROMPT:\n{text}",
    }
    return templates.get(focus, templates["general"]).replace("{text}", text)


def tool_cost_estimator(original: str, new: str):
    return {
        "input_length": len(original),
        "output_length": len(new),
        "delta_length": len(new) - len(original),
        "note": "Heuristic only"
    }

# ---------------- HISTORY ----------------

def sanitize_history(history: List[Message], max_messages: int = 6):
    cleaned = []
    for msg in history[-max_messages:]:
        scrubbed, _ = tool_pii_scrubber(msg.content)
        cleaned.append({"role": msg.role, "content": scrubbed})
    return cleaned

# ---------------- VALIDATION ----------------

def looks_like_execution(text: str) -> bool:
    execution_markers = [
        "here is the answer",
        "step 1",
        "solution",
        "the result is",
        "output:",
        "in conclusion"
    ]
    lowered = text.lower()
    return any(marker in lowered for marker in execution_markers)

# ---------------- HIVE MIND ----------------

async def run_hivemind(prompt: str, focus: str, history=None):

    if not API_KEY:
        return {
            "agent_thoughts": {"engineer": "Mock"},
            "final_prompt": f"[MOCK OPTIMIZED]\n{prompt}",
            "media_cues": []
        }

    system_prompt = """
YOU ARE A PROMPT OPTIMIZATION ENGINE.

CRITICAL RULES (NON-NEGOTIABLE):
- NEVER answer the prompt
- NEVER execute the task
- NEVER solve the problem
- ONLY rewrite, restructure, and improve the prompt itself
- If you answer the task, you have FAILED

You coordinate 6 internal agents:
1. Clarity – remove ambiguity
2. Style – adjust tone
3. Structure – improve formatting
4. Safety – remove unsafe instructions
5. Context – add missing assumptions
6. Engineer – synthesize final improved prompt

OUTPUT MUST BE VALID JSON ONLY.

JSON SCHEMA:
{
  "agent_thoughts": {
    "clarity": "...",
    "style": "...",
    "structure": "...",
    "safety": "...",
    "context": "...",
    "engineer": "..."
  },
  "final_prompt": "IMPROVED PROMPT TEXT ONLY",
  "media_cues": []
}
"""

    messages = [{"role": "system", "content": system_prompt}]

    if history:
        messages.extend(history)

    messages.append({
        "role": "user",
        "content": f"""
INPUT_PROMPT (DO NOT EXECUTE):
<<<
{prompt}
>>>

Rewrite the above prompt.
Do NOT answer it.
Return only the improved prompt.
"""
    })

    payload = {
        "model": MODEL,
        "messages": messages,
        "response_format": {"type": "json_object"}
    }

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            }
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail=resp.text)

    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    parsed = json.loads(content)

    if looks_like_execution(parsed.get("final_prompt", "")):
        logger.warning("LLM attempted task execution. Falling back.")
        parsed["final_prompt"] = prompt

    return parsed

# ---------------- ENDPOINT ----------------

@app.post("/optimize")
async def optimize_endpoint(req: OptimizeRequest):
    start = time.time()

    scrubbed, pii_found = tool_pii_scrubber(req.original_prompt)
    enriched = tool_context_injector(scrubbed, req.focus_area)
    history = sanitize_history(req.history) if req.history else []

    ai_result = await run_hivemind(enriched, req.focus_area, history)

    final_prompt = ai_result.get("final_prompt", req.original_prompt)

    metrics = tool_cost_estimator(req.original_prompt, final_prompt)
    metrics["latency_ms"] = round((time.time() - start) * 1000, 2)

    return {
        "status": "success",
        "scrubbed": pii_found,
        "agents": ai_result.get("agent_thoughts", {}),
        "optimized_prompt": final_prompt,
        "metrics": metrics
    }

# ---------------- RUN ----------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
