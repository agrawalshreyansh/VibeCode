import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import requests
import json
import dotenv
import os

# Load .env deterministically: server/.env first, then project-root .env if present
_SERVER_ENV = Path(__file__).resolve().parent / ".env"
_ROOT_ENV = Path(__file__).resolve().parents[1] / ".env"
dotenv.load_dotenv(dotenv_path=_SERVER_ENV, override=False)
dotenv.load_dotenv(dotenv_path=_ROOT_ENV, override=False)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "x-ai/grok-4-fast:free")

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.INFO)

if not OPENROUTER_API_KEY:
    logger.warning("OPENROUTER_API_KEY not found; /send_prompt will return 500 until it is set.")

app = FastAPI()

# In-memory storage for conversation context
conversation_context: Dict[str, Any] = {}

# Request model for /send_prompt
class PromptRequest(BaseModel):
    prompt: str
    previous_summary: Optional[str] = ""
    user_context: Optional[str] = ""
    model: Optional[str] = None

def grok_response_with_brief_context(
    prompt: str,
    previous_summary: str = "",
    user_context: str = "",
    model: Optional[str] = None,
) -> dict:
    """
    Sends prompt to Grok, gets assistant reply, and updates a short context summary (10-30 words).
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured on server")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    # Step 1: Get assistant reply
    assistant_payload = {
        "model": model or DEFAULT_MODEL,
        "messages": [
            {
                "role": "user",
                "content": (
                    "You are a therapist / mental wellness companion. Provide support, guidance, and encouragement for mental wellness, "
                    "stress management, and emotional well-being. Incorporate short breathing or relaxation exercises when relevant. "
                    "Keep the answer concise, clear, and descriptive. If the user asks questions outside your domain, redirect gently.\n\n"
                    f"chat user context:{user_context}\n"
                    f"chat summary of convo context:{previous_summary}\n"
                    f"Question: {prompt}"
                )
            }
        ]
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(assistant_payload),
            timeout=60,
        )
        response.raise_for_status()
        res_json = response.json()
    except requests.HTTPError as e:
        detail = e.response.text if e.response is not None else str(e)
        raise HTTPException(status_code=502, detail=f"OpenRouter error: {detail}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenRouter request failed: {e}")

    assistant_reply = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")

    # Step 2: Generate a short summary of this reply (10-30 words)
    summary_prompt = f"Summarize the following text in 10-30 words, keeping only the important points: {assistant_reply}"
    summary_payload = {
        "model": model or DEFAULT_MODEL,
        "messages": [
            {"role": "user", "content": summary_prompt}
        ]
    }

    try:
        summary_response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(summary_payload),
            timeout=60,
        )
        summary_response.raise_for_status()
        summary_json = summary_response.json()
    except requests.HTTPError as e:
        # If summarization fails, continue with empty brief summary
        logger.warning("OpenRouter summary error: %s", e)
        summary_json = {}
    except Exception as e:
        logger.warning("OpenRouter summary request failed: %s", e)
        summary_json = {}

    brief_summary = summary_json.get("choices", [{}])[0].get("message", {}).get("content", "")

    # Step 3: Combine with previous summary
    new_summary = f"{previous_summary} {brief_summary}".strip()

    return {
        "response": assistant_reply,
        "new_context": {
            "summary": new_summary
        }
    }

@app.post("/send_prompt")
async def send_prompt(data: PromptRequest):
    global conversation_context

    result = grok_response_with_brief_context(
        prompt=data.prompt,
        previous_summary=data.previous_summary,
        user_context=data.user_context,
        model=data.model,
    )

    # Update in-memory context
    conversation_context = result.get("new_context", {})
    return {"status": "success", "response": result["response"], "new_context": conversation_context}

@app.get("/get_context")
async def get_context():
    if not conversation_context:
        return {"message": "No context available yet."}
    return conversation_context

# Run using: uvicorn filename:app --reload
