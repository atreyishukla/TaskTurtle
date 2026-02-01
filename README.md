Overview

TaskTurtle is a productivity web application that helps users plan their day, organize tasks, and stay focused using a built-in task timer. With Penny the Turtle as a calm and encouraging companion, TaskTurtle promotes steady progress and mindful productivity through gentle reminders, chime notifications, and simple interactions that make routine-building feel approachable.




Features:

- Add, edit, delete, and reorder tasks using a simple drag-and-drop interface
- Built-in timer that automatically completes tasks when time expires
- Chime sound and friendly pop-up message when a task is completed
- Tasks, timing state, and session progress saved locally for persistence
- Clean and calming UI featuring custom turtle-themed artwork
- Lightweight break-time mini-interactions for stress relief
- Fully responsive layout for both desktop and mobile


Tech Stack:

- Frontend: React (Vite), Material UI, DnD Kit
- Backend: Flask (Python)
- Storage: LocalStorage
- Assets: Custom images and audio


Installation:
- Clone the repository:

  git clone https://github.com/atreyishukla/TaskTurtle.git

  cd TaskTurtle



- Create and activate a virtual environment:

  python -m venv venv

  source venv/bin/activate # On macOS/Linux

  venv\Scripts\activate # On Windows

  

- Install backend dependencies:

  pip install -r requirements.txt

  

- Run the backend:

  python app/main.py

  

- Navigate to the frontend folder:

  cd frontend



- Install frontend dependencies:

  npm install

  
  
- Start the frontend development server:

  npm run dev

  
  
- Open your browser and go to:

  Frontend: http://localhost:5173

  Backend: http://127.0.0.1:8000



Usage:
- Add tasks with a name, duration, and type
- Start the timer to begin working on the active task
- Allow the timer to finish or mark tasks complete manually
- Hear a gentle chime and see Penny’s motivational message
- Reorder tasks anytime using drag-and-drop


Disclaimer:

TaskTurtle is intended for personal productivity and educational purposes only. It does not provide psychological, therapeutic, or professional time-management advice. Users should choose approaches and routines that best support their own well-being.
