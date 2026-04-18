from agents.run import Runner
from ai_agents.orchestrator_agent import orchestrator_agent
from memory.session import get_session

async def process_chat_message(session_id: str, message: str) -> str:
    """Pass the user's message to the AI agentic system using the orchestrator."""
    session = get_session(session_id)
    
    # Send message to the Orchestrator
    result = await Runner.run(
        orchestrator_agent,
        message,
        session=session
    )
    
    return result.final_output
