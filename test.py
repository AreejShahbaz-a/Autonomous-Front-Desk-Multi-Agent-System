import asyncio
from agents import Agent
from agents.run import Runner
from ai_agents.patient_agent import patient_agent
from ai_agents.information_agent import information_agent
from memory.session import get_session


async def main():
    session = get_session("user_1")  

    # Turn 1
    result = await Runner.run(
        patient_agent,
        "My patient number is P003",
        session=session
    )
    print(result.final_output)

    # Turn 2 (context is remembered)
    result = await Runner.run(
        patient_agent,
        "what is my name",
        session=session
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())