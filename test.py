import asyncio
from agents import Agent
from agents.run import Runner
from ai_agents.patient_agent import patient_agent
from ai_agents.information_agent import information_agent
from ai_agents.appointment_agent import appointment_agent
from ai_agents.orchestrator_agent import orchestrator_agent
from memory.session import get_session


async def main():
    session = get_session("test_session")  

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

        print("Agent:", result.final_output)


if __name__ == "__main__":
    asyncio.run(main())