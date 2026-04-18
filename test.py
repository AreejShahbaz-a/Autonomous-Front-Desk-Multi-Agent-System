import asyncio
from agents import Agent
from agents.run import Runner
from ai_agents.patient_agent import patient_agent
from ai_agents.information_agent import information_agent
from ai_agents.appointment_agent import appointment_agent
from ai_agents.orchestrator_agent import orchestrator_agent
from tools.appointment_tools import suggest_available_slots, book_appointment, cancel_appointment_by_id, reschedule_appointment
from memory.session import get_session
from db.database import get_connection
import tools.patient_tools


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

    #print(suggest_available_slots("Dr Amina","2026-04-20"))
    #print(book_appointment("P002","Dr Sara","2026-04-24","9:00"))
    #print(cancel_appointment_by_id("8"))
    #print(tools.patient_tools.check_patient_existence("P006"))
    #print(tools.patient_tools.get_patient_info("P007"))
    #print(tools.patient_tools.get_patient_appointments("P007"))
    #print(tools.patient_tools.create_patient("Areej Shahbaz","03214766095","3520242466670","PCHS","areejshahbaz2004@gmail.com","female"))
    #print(reschedule_appointment("10","2026-04-23","11:00"))


if __name__ == "__main__":
    asyncio.run(main())