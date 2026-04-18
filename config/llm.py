from openai import AsyncOpenAI
from agents import OpenAIChatCompletionsModel
from config.settings import OPENAI_API_KEY


def get_model():
    client = AsyncOpenAI(
        base_url="https://api.openai.com/v1",
        api_key=OPENAI_API_KEY
    )

    return OpenAIChatCompletionsModel(
        model="gpt-5.4-nano",
        openai_client=client
    )