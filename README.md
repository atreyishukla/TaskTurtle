TaskTurtle
Overview
TaskTurtle is a productivity web application that helps users plan their day, manage tasks, and stay focused using a built-in task timer. With Penny the Turtle as a gentle and encouraging companion, TaskTurtle promotes slow, steady progress and mindful productivity.
Users can create schedules, sort tasks, track their progress, and receive a friendly chime and motivational message whenever a task is completed.
Features
Add, edit, delete, and reorder tasks through a simple drag-and-drop interface
Built-in timer that counts down each task’s duration and auto-completes when time runs out
Chime notification and encouraging pop-up message when a task is completed
Tasks, timing state, and progress are saved using local storage
Clean UI with soft colors and turtle-themed visuals
Lightweight break-time mini-interactions
Responsive design for desktop and mobile
Tech Stack
Frontend: React (Vite), Material UI, DnD Kit
Backend: Flask (Python)
Storage: LocalStorage
Assets: Custom images and audio
Installation
Clone the repository:
git clone https://github.com/atreyishukla/TaskTurtle.git
cd TaskTurtle
Backend Setup
Create and activate a virtual environment:
python -m venv venv
source venv/bin/activate (macOS/Linux)
venv\Scripts\activate (Windows)
Install backend dependencies:
pip install -r requirements.txt
Run the backend:
python app/main.py
Frontend Setup
Navigate to the frontend folder:
cd frontend
Install frontend dependencies:
npm install
Start the frontend development server:
npm run dev
Backend typically runs at:
http://127.0.0.1:5000
Frontend typically runs at:
http://localhost:5173
Usage
Add tasks with a name, duration, and type
Press Start to begin the timer for the current task
Allow the timer to finish or manually complete the task
Receive a chime and a motivational message from Penny the Turtle
Reorder tasks using drag-and-drop
Disclaimer
TaskTurtle is intended for personal productivity and educational use only. It does not provide psychological, therapeutic, or professional time-management advice. Users should choose workflows and routines that best support their own well-being.
