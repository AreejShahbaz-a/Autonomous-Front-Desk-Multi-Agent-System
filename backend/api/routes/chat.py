from fastapi import APIRouter
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone
from api.services.chat_service import process_chat_message
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"

@router.post("/chat")
async def chat(request: ChatRequest):
    logger.info(f"Incoming chat request - Session: {request.session_id}, Message: {request.message[:50]}...")
    
    # Process the chat message through our agentic ai system
    agent_msg = await process_chat_message(request.session_id, request.message)
    
    logger.info(f"Agent response generated - Session: {request.session_id}, Response: {agent_msg[:50]}...")
    
    return {
        "id": str(uuid.uuid4()),
        "role": "agent",
        "content": agent_msg,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }