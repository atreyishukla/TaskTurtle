import random
import numpy as np
from sklearn.ensemble import RandomForestRegressor

# -----------------------------
# TASK AND MOOD DEFINITIONS
# -----------------------------
TASK_TYPES = ["study", "chores", "work", "exercise", "leisure", "other"]

MOOD_ENCODING = {
    "tired": 0,
    "ok": 1,
    "motivated": 2,
    "stressed": 3,
    "anxious": 4,
    "overwhelmed": 5,
    "relaxed": 6
}

MOOD_SUGGESTIONS = {
    "tired": ["Start low-effort tasks.", "Use 20–25 min intervals.", "Avoid heavy cognitive tasks early."],
    "motivated": ["Do high-difficulty tasks first.", "Cluster similar tasks.", "Push your productive window!"],
    "stressed": ["Start with quick wins.", "Prioritize small tasks.", "Avoid long focus blocks."],
    "anxious": ["Focus on one task at a time.", "Break tasks into chunks.", "Reduce cognitive load early."],
    "overwhelmed": ["Simplify your plan.", "Start with extremely small tasks.", "Introduce extra breaks."],
    "relaxed": ["Use calm state for difficult tasks.", "Cluster similar tasks.", "Try medium-intensity tasks first."],
    "ok": ["Balanced sequence.", "Avoid multitasking.", "Steady pacing works well."]
}

# -----------------------------
# ENCODING FUNCTIONS
# -----------------------------
def encode_mood(mood):
    return MOOD_ENCODING.get(mood, 1)

def mood_suggestions(mood: str):
    mood = mood.lower()
    return MOOD_SUGGESTIONS.get(mood, MOOD_SUGGESTIONS["ok"])[0]

def encode_task(task, mood):
    duration = task["duration"]
    difficulty = task["difficulty"]
    urgency = task.get("urgency", 3)
    ttype = task["type"]
    mood_enc = encode_mood(mood)
    type_onehot = [1 if ttype == tt else 0 for tt in TASK_TYPES]
    return [duration, difficulty, urgency, mood_enc] + type_onehot

# -----------------------------
# SYNTHETIC DATA GENERATION
# -----------------------------
def generate_sample():
    duration = random.randint(15, 180)
    difficulty = random.randint(1, 5)
    urgency = random.randint(1, 5)
    mood = random.choice(list(MOOD_ENCODING.keys()))
    ttype = random.choice(TASK_TYPES)

    mood_factor = encode_mood(mood)
    priority = urgency * 10 + difficulty * (mood_factor + 1) + random.randint(-2,2)
    mental_load = difficulty * 2 + duration/60 - (mood_factor/2)
    type_onehot = [1 if ttype == tt else 0 for tt in TASK_TYPES]
    features = [duration, difficulty, urgency, encode_mood(mood)] + type_onehot

    return features, priority, mental_load

def generate_dataset(n=2000):
    X, y_priority, y_mental = [], [], []
    for _ in range(n):
        f, p, m = generate_sample()
        X.append(f)
        y_priority.append(p)
        y_mental.append(m)
    return np.array(X), np.array(y_priority), np.array(y_mental)

X, y_priority, y_mental = generate_dataset(2000)

PRIORITY_MODEL = RandomForestRegressor(n_estimators=80, random_state=42)
PRIORITY_MODEL.fit(X, y_priority)

MENTAL_MODEL = RandomForestRegressor(n_estimators=80, random_state=42)
MENTAL_MODEL.fit(X, y_mental)

# -----------------------------
# MOOD-BASED TASK REORDERING
# -----------------------------
def reorder_tasks_by_mood(tasks, mood):
    if mood == "motivated":
        return sorted(tasks, key=lambda x: (-x["priority_score"], -x["difficulty"]))
    if mood == "tired":
        return sorted(tasks, key=lambda x: (x["difficulty"], x["duration"]))
    if mood in ["stressed", "anxious"]:
        return sorted(tasks, key=lambda x: (-x["priority_score"]/x["duration"], x["duration"]))
    if mood == "overwhelmed":
        return sorted(tasks, key=lambda x: (x["difficulty"], x["duration"]))
    if mood == "relaxed":
        return sorted(tasks, key=lambda x: x["difficulty"])
    return sorted(tasks, key=lambda x: -x["priority_score"])

# -----------------------------
# BREAK INTERVALS
# -----------------------------
def get_break_interval(mood, tasks):
    avg_load = np.mean([t["mental_load"] for t in tasks]) if tasks else 1
    base_interval = {
        "tired": 35,
        "stressed": 35,
        "anxious": 35,
        "overwhelmed": 25,
        "motivated": 70,
        "relaxed": 55,
        "ok": 50
    }.get(mood, 50)
    return max(20, int(base_interval - avg_load*2))

# -----------------------------
# FINAL SCHEDULING
# -----------------------------
def predict_for_tasks(tasks, mood):
    scheduled_tasks = []

    # Score tasks
    scored_tasks = []
    for task in tasks:
        features = np.array([encode_task(task, mood)])
        scored_tasks.append({
            "task": task["name"],
            "duration": task["duration"],
            "difficulty": task["difficulty"],
            "urgency": task.get("urgency", 3),
            "priority_score": float(PRIORITY_MODEL.predict(features)[0]),
            "mental_load": float(MENTAL_MODEL.predict(features)[0]),
            "type": task["type"],
        })

    # Reorder based on mood
    scored_tasks = reorder_tasks_by_mood(scored_tasks, mood)
    break_interval = get_break_interval(mood, scored_tasks)

    minutes_used = 0
    break_counter = 0

    # Optional calming break for overwhelmed
    if mood == "overwhelmed":
        scheduled_tasks.append({
            "task": "Calming Break",
            "type": "break",
            "start_minute": minutes_used,
            "end_minute": minutes_used + 8,
            "priority_score": 0,
            "mental_load": 0
        })
        minutes_used += 8

    # Schedule tasks with breaks
    for t in scored_tasks:
        task_start = minutes_used
        task_end = task_start + t["duration"]

        scheduled_tasks.append({
            "task": t["task"],
            "type": t["type"],
            "start_minute": task_start,
            "end_minute": task_end,
            "priority_score": t["priority_score"],
            "mental_load": t["mental_load"]
        })

        minutes_used += t["duration"]
        break_counter += t["duration"]

        if break_counter >= break_interval:
            break_start = minutes_used
            break_end = break_start + 10
            scheduled_tasks.append({
                "task": "Break",
                "type": "break",
                "start_minute": break_start,
                "end_minute": break_end,
                "priority_score": 0,
                "mental_load": 0
            })
            minutes_used += 10
            break_counter = 0

    return {"tasks": scheduled_tasks, "mood_advice": mood_suggestions(mood)}
