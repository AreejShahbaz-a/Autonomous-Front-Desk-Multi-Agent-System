# Autonomous Front Desk — Multi-Agent System

A lightweight multi-agent system designed to automate front-desk workflows for healthcare clinics. This repository contains a Python backend with multiple cooperating AI agents, a REST API, a simple memory store, and a TypeScript + Vite frontend chat UI.

Key goals:
- Orchestrate appointment scheduling, patient information retrieval, and communications
- Provide a developer-friendly API and local development setup
- Demonstrate a modular, extensible multi-agent architecture

--

## Features
- Multi-agent orchestration (appointment, information, patient, orchestrator)
- REST API for chat and admin operations
- RAG-friendly structure and session memory support
- Email and Google Calendar integration helpers
- Web-based chat UI (Vite + TypeScript)

--

## Architecture Overview

- Backend: Python (FastAPI-flavored structure). Core entry: [backend/main.py](backend/main.py)
- Agents: [backend/ai_agents](backend/ai_agents) — each agent focuses on a domain: appointments, patient data, info, and orchestration
- API routes: [backend/api/routes](backend/api/routes) with route handlers for chat and admin operations
- Services: [backend/api/services/chat_service.py](backend/api/services/chat_service.py)
- Data: lightweight DB and models in [backend/data](backend/data)
- Web UI: [web](web) — Vite + TypeScript chat client in [web/src](web/src)

--

## Quick Start (Development)

Prerequisites
- Python 3.10+ (recommended)
- Node.js 16+ and npm
- Optional: an OpenAI/LLM API key and SMTP credentials for email features

Backend setup

1. Create and activate a virtual environment inside `backend`:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1    # PowerShell
```

2. Install Python dependencies:

```powershell
pip install -r requirements.txt
```

3. Configure environment variables. Create a `.env` or export the following as needed:

- `OPENAI_API_KEY` (or your chosen LLM provider API key)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (for sending emails)
- `GOOGLE_CALENDAR_CREDENTIALS` (if using Google Calendar integration)

4. Run the backend (development):

```powershell
python main.py
```

By default the backend exposes the API routes in [backend/api/routes](backend/api/routes). Check `main.py` for the configured host/port.

Web frontend setup

1. Install web deps and run dev server:

```bash
cd web
npm install
npm run dev
```

2. Open the Vite dev URL (typically `http://localhost:5173/`) and use the chat UI located in [web/src/app/components](web/src/app/components).

--

## Running the System

- Start the backend: `python backend/main.py`
- Start the frontend: `npm run dev` in `web`
- Use the chat UI to interact with agents, or call the API endpoints in [backend/api/routes/chat.py](backend/api/routes/chat.py)

Example API (HTTP)

- POST /chat -> main chat entrypoint (see [backend/api/routes/chat.py](backend/api/routes/chat.py))

--

## Agents & Tools

- `backend/ai_agents/orchestrator_agent.py` — coordinates tasks across agents
- `backend/ai_agents/appointment_agent.py` — handles scheduling logic and Google Calendar interactions
- `backend/ai_agents/information_agent.py` — answers domain questions and retrieves reference data
- `backend/ai_agents/patient_agent.py` — looks up and updates patient records

Supporting tools/helpers are in `backend/tools` and `backend/utils`, for example:
- [backend/tools/appointment_tools.py](backend/tools/appointment_tools.py)
- [backend/utils/email.py](backend/utils/email.py)

--

## Data & Persistence

- Simple DB layer: [backend/data/database.py](backend/data/database.py) and models in [backend/data/models.py]
- `backend/data/seed.py` contains test data helpers for development and demos

Note: This project uses an embedded, lightweight approach to persistence for demo purposes. For production, swap the DB layer for a managed database.

--

## Testing

- Run unit or integration tests (if present). Basic test file: [backend/test.py](backend/test.py)
- Add tests for agents and API routes under `backend/tests/` (not present by default)

--

## Development Notes & Tips

- Configure LLM provider in [backend/config/llm.py](backend/config/llm.py) and settings in [backend/config/settings.py](backend/config/settings.py)
- Session memory and short-term context is handled in [backend/memory/session.py](backend/memory/session.py)
- To enable email notifications, verify SMTP settings with `backend/scripts/test_smtp_connection.py`
- To send a sample appointment email, check `backend/scripts/send_test_email.py`

--

## Project Structure (high level)

- [backend](backend) — Python agents, API, data, tools
	- [backend/main.py](backend/main.py) — application entry
	- [backend/api/routes](backend/api/routes) — API endpoints
	- [backend/ai_agents](backend/ai_agents) — agent implementations
	- [backend/data](backend/data) — models and DB
- [web](web) — Vite + TypeScript chat UI client

--