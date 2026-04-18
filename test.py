import asyncio
from agents import Agent
from agents.run import Runner
from ai_agents.patient_agent import patient_agent
from ai_agents.information_agent import information_agent
from ai_agents.appointment_agent import appointment_agent
from ai_agents.orchestrator_agent import orchestrator_agent
from tools.appointment_tools import suggest_available_slots, book_appointment
from memory.session import get_session
from db.database import get_connection


async def main():
    """session = get_session("test_session")  

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit"]:
            print("Session ended.")
            break

        result = await Runner.run(
            orchestrator_agent,
            user_input,
            session=session
        )

        print("Agent:", result.final_output)"""

    #print(suggest_available_slots("Dr Amina","2026-04-20"))
    print(book_appointment("P008","Dr Ahmed","2026-04-20","9:00"))


if __name__ == "__main__":
    asyncio.run(main())