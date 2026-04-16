from fastapi import FastAPI
from contextlib import asynccontextmanager
from db.models import create_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(
    title="Hospital Front Desk AI System",
    lifespan=lifespan
)

@app.get("/")
def home():
    return {"message": "Backend is working!"}

@app.post("/chat")
def chat(message: str):
    return {"response": "You said: " + message}