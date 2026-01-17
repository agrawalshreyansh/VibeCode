import logging
import os
import time
import json
import re
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import aiohttp

# ---------------- CONFIG ----------------

API_KEY = os.getenv("OPENROUTER_API_KEY", "")
MODEL = "google/gemini-2.0-flash-exp:free"

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

# ---------------- REQUEST MODEL ----------------

class OptimizeRequest(BaseModel):
    original_prompt: str
    focus_area: Optional[str] = "general"

# ---------------- CUSTOM TOOLS ----------------

def tool_pii_scrubber(text: str):
    """
    Tool 1: Heuristic PII redaction (India-aware).
    NOTE: Not compliance-grade. Demo + safety intent only.
    """
    patterns = {
        "email": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
        "phone_in": r'(\+91[\-\s]?)?[6-9]\d{9}',
        "aadhaar": r'\b\d{4}\s?\d{4}\s?\d{4}\b',
        "pan": r'\b[A-Z]{5}[0-9]{4}[A-Z]\b'
    }

    scrubbed = text
    pii_found = False

    for pattern in patterns.values():
        new_text = re.sub(pattern, "[REDACTED]", scrubbed)
        if new_text != scrubbed:
            pii_found = True
        scrubbed = new_text

    # Light name masking (heuristic)
    name_pattern = r'\b[A-Z][a-z]+ [A-Z][a-z]+\b'
    new_text = re.sub(name_pattern, "[NAME_REDACTED]", scrubbed)
    if new_text != scrubbed:
        pii_found = True
    scrubbed = new_text

    return scrubbed, pii_found


def tool_context_injector(text: str, focus: str):
    """
    Tool 2: Deterministic context injection.
    """
    templates = {
        "coding": (
            "Role: Senior Principal Software Engineer\n"
            "Constraints: Clean, efficient, production-grade code\n"
            "Task:\n{text}"
        ),
        "academic": (
            "Role: Research Scholar\n"
            "Tone: Formal, objective\n"
            "Task:\n{text}"
        ),
        "creative": (
            "Role: Best-Selling Author\n"
            "Style: Vivid, show-don't-tell\n"
            "Task:\n{text}"
        ),
        "general": (
            "Role: Helpful Expert Assistant\n"
            "Task:\n{text}"
        )
    }

    template = templates.get(focus, templates["general"])
    return template.replace("{text}", text)


def tool_cost_estimator(original: str, new: str):
    """
    Tool 3: Honest heuristic metrics (non-scientific).
    """
    return {
        "input_length": len(original),
        "output_length": len(new),
        "delta_length": len(new) - len(original),
        "note": "Heuristic metadata only; not a quality guarantee"
    }

# ---------------- AGENT ORCHESTRATOR ----------------

async def run_hivemind(prompt: str, focus: str):
    """
    Single-call multi-agent orchestration with strict contracts.
    """

    # Fallback mode if no API key
    if not API_KEY:
        return {
            "agent_thoughts": {
                "clarity": "Mock: intent clear",
                "style": "Mock: adjusted tone",
                "structure": "Mock: structured output",
                "safety": "Mock: safe",
                "context": "Mock: context added",
                "engineer": "Mock synthesis"
            },
            "final_prompt": f"[MOCK OPTIMIZED]\n{prompt}",
            "media_cues": []
        }

    system_prompt = f"""
You are a HiveMind Orchestrator coordinating 6 specialized agents.

AGENT CONTRACTS:
1. Clarity Agent – remove ambiguity
2. Style Agent – adjust tone for '{focus}'
3. Structure Agent – improve formatting and hierarchy
4. Safety Agent – detect unsafe or invalid instructions
5. Context Agent – add missing background or assumptions
6. Prompt Engineer – synthesize final optimized prompt

RULES:
- Agents must not overlap responsibilities
- Prompt Engineer resolves conflicts
- Output MUST be strict JSON
- No markdown, no explanations outside JSON

JSON SCHEMA:
{{
  "agent_thoughts": {{
    "clarity": "...",
    "style": "...",
    "structure": "...",
    "safety": "...",
    "context": "...",
    "engineer": "..."
  }},
  "final_prompt": "OPTIMIZED_PROMPT",
  "media_cues": ["keyword1", "keyword2"]
}}
"""

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"}
    }

    async with aiohttp.ClientSession(
        timeout=aiohttp.ClientTimeout(total=20)
    ) as session:
        async with session.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            }
        ) as resp:

            if resp.status == 429:
                raise HTTPException(status_code=503, detail="LLM rate limited")

            if resp.status != 200:
                err = await resp.text()
                raise HTTPException(status_code=500, detail=f"LLM error: {err}")

            data = await resp.json()

            try:
                content = data["choices"][0]["message"]["content"]
                content = content.replace("```json", "").replace("```", "").strip()
                return json.loads(content)
            except Exception:
                logger.error("LLM JSON parse failure")
                return {
                    "agent_thoughts": {
                        "clarity": "Failed",
                        "style": "Failed",
                        "structure": "Failed",
                        "safety": "Failed",
                        "context": "Failed",
                        "engineer": "Fallback"
                    },
                    "final_prompt": prompt,
                    "media_cues": []
                }

# ---------------- API ENDPOINT ----------------

@app.post("/optimize")
async def optimize_endpoint(req: OptimizeRequest):
    start = time.time()

    # Step 1: Local tools
    scrubbed_text, pii_found = tool_pii_scrubber(req.original_prompt)
    enriched_text = tool_context_injector(scrubbed_text, req.focus_area)

    # Step 2: AI orchestration
    try:
        ai_result = await run_hivemind(enriched_text, req.focus_area)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))

    final_prompt = ai_result.get("final_prompt", req.original_prompt)

    # Step 3: Metrics
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
    print("🚀 Nexus Backend running at http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
