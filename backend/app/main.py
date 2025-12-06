from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .scheduler import predict_for_tasks

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    name: str
    duration: int
    difficulty: int
    urgency: int = 3
    type: str

class InputData(BaseModel):
    tasks: list[Task]
    mood: str

@app.post("/predict")
def predict(data: InputData):
    result = predict_for_tasks(
        tasks=[task.dict() for task in data.tasks],
        mood=data.mood
    )
    return result
