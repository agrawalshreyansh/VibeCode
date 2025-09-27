# VibeCode Text Analysis Server

This FastAPI server provides a text-to-text analysis endpoint. Given plain text, it returns:

- sentiment (positive/neutral/negative)
- sentiment_score (-1..1)
- mood (happy/sad/neutral)
- summary_short (optional)
- keywords (optional)

It uses OpenAI if `OPENAI_API_KEY` is set, otherwise falls back to a lightweight local heuristic.

## Requirements
- Python 3.10+
- Optional: OpenAI API key for better quality analysis

## Setup
1. Create a virtual environment and install dependencies:

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
```

2. Configure your environment variables (optional but recommended):

```
cp server/.env.example server/.env
# edit server/.env and set OPENAI_API_KEY (and optionally OPENAI_MODEL/OPENAI_BASE_URL)
```

## Run the server

Run directly with Python (auto-reload):

```
python server/main.py
```

Or with uvicorn:

```
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```

## API
- POST /analyze-text
  - JSON body: `{ "text": string, "return_summary": boolean = true, "return_keywords": boolean = true }`
  - Response: `{ text, sentiment, sentiment_score, mood, summary_short?, keywords? }`

- GET /health

## Notes
- Without an OpenAI key, the server uses a basic heuristic for sentiment, a simple mood mapping, a naive 2-sentence summary, and keyword frequency extraction. It’s fast, but not as nuanced.
- With OpenAI, you’ll get better quality for sentiment, mood, and summaries. You can set `OPENAI_MODEL` as needed.
