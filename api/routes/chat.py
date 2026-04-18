from fastapi import APIRouter
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone
from api.services.chat_service import process_chat_message

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"

@router.post("/chat")
async def chat(request: ChatRequest):
    # Process the chat message through our agentic ai system
    agent_msg = await process_chat_message(request.session_id, request.message)
    
    return {
        "id": str(uuid.uuid4()),
        "role": "agent",
        "content": agent_msg,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }