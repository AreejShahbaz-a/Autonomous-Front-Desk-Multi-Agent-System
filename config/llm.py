from openai import AsyncOpenAI
from agents import OpenAIChatCompletionsModel
from config.settings import OPENROUTER_API_KEY


def get_model():
    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY
    )

    return OpenAIChatCompletionsModel(
        model="openai/gpt-oss-120b:free",
        openai_client=client
    )