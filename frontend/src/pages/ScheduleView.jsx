import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  Button,
  IconButton,
  Modal,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";

// --- Helpers ---

const load = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const save = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};
const formatSeconds = (secs) => {
  if (secs == null) return "--:--";
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

// Sortable task component
function SortableTask({ id, index, task, isActive, onComplete, onEditToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderRadius: 12,
        background: task.type === "break" ? "#fff7ef" : "#e9f1ff",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
        <Box
          {...listeners}
          sx={{ cursor: "grab", display: "flex", alignItems: "center" }}
        >
          <DragIndicatorIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: 19,
              fontWeight: 700,
              fontFamily: "'Bree Serif', serif",
              color: "primary.main",
            }}
          >
            {task.task}{" "}
            {isActive && (
              <span style={{ fontSize: 15, marginLeft: 4 }}>(current)</span>
            )}
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              color: "primary.main",
              fontFamily: "'Bree Serif', serif",
            }}
          >
            {task.duration ?? 0} min
            {typeof task.priority_score === "number" && (
              <> | Priority: {task.priority_score.toFixed(1)}</>
            )}
            <> | Type: {task.type}</>
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", marginLeft: 1 }}>
        <IconButton
          size="small"
          onClick={() => onComplete(index)}
          sx={{ color: "#2e7d32" }}
        >
          <CheckCircleIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onEditToggle(index)}>
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(index)}
          sx={{ color: "#b71c1c" }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </div>
  );
}

export default function ScheduleView() {
  const [schedule, setSchedule] = useState(() => load("schedule", null));
  const tasks = schedule?.tasks ?? [];

  const sensors = useSensors(useSensor(PointerSensor));

  const [currentIndex, setCurrentIndex] = useState(() => load("sv_currentIndex", 0));
  const [timeLeft, setTimeLeft] = useState(() => load("sv_timeLeft", null));
  const [timerRunning, setTimerRunning] = useState(() => load("sv_timerRunning", false));
  const [timerEndTs, setTimerEndTs] = useState(() => load("sv_timerEndTs", null));

  const [completionModal, setCompletionModal] = useState({
    open: false,
    message: "",
  });

  // Editing state (name + duration + type)
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingDuration, setEditingDuration] = useState("");
  const [editingType, setEditingType] = useState("study");

  const intervalRef = useRef(null);
  const chimeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => save("schedule", schedule), [schedule]);
  useEffect(() => save("sv_currentIndex", currentIndex), [currentIndex]);
  useEffect(() => save("sv_timeLeft", timeLeft), [timeLeft]);
  useEffect(() => save("sv_timerRunning", timerRunning), [timerRunning]);
  useEffect(() => save("sv_timerEndTs", timerEndTs), [timerEndTs]);

  // Compute seconds for a task based on its duration (in minutes)
  const computeSecsForTask = useCallback(
    (idx, tasksArg = tasks) => {
      if (!tasksArg || !tasksArg[idx]) return 25 * 60;
      const dur = tasksArg[idx].duration ?? 25; // duration in minutes
      return dur * 60;
    },
    [tasks]
  );

  // Play chime whenever a task completes
  const playChime = useCallback(() => {
    if (chimeRef.current) {
      try {
        chimeRef.current.currentTime = 0;
        chimeRef.current.play();
      } catch (e) {
        // ignore autoplay / audio errors
      }
    }
  }, []);

  // When tasks list changes, clamp current index and (only if idle) set initial time
  useEffect(() => {
    if (!tasks.length) {
      setTimeLeft(null);
      setTimerRunning(false);
      setTimerEndTs(null);
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) => {
      const clamped = Math.min(prev ?? 0, tasks.length - 1);
      // Only initialize time if we're not currently timing anything
      if (!timerRunning && timeLeft == null) {
        const secs = computeSecsForTask(clamped, tasks);
        setTimeLeft(secs);
      }
      return clamped;
    });
  }, [tasks, computeSecsForTask, timerRunning, timeLeft]);

  const handleAutoComplete = useCallback(
    (idxOverride = null) => {
      if (!tasks.length) return;

      const idx = idxOverride != null ? idxOverride : currentIndex;
      if (!tasks[idx]) return;

      // Play chime when a task is completed (manual, next, or timer)
      playChime();

      const newTasks = tasks.filter((_, i) => i !== idx);

      setSchedule((prev) =>
        prev ? { ...prev, tasks: newTasks } : { tasks: newTasks }
      );
      setCompletionModal({ open: true, message: `great going!` });

      // Stop the timer on completion and DO NOT start the next automatically
      setTimerRunning(false);
      setTimerEndTs(null);

      if (!newTasks.length) {
        setCurrentIndex(0);
        setTimeLeft(null);
        return;
      }

      const nextIdx = Math.min(idx, Math.max(0, newTasks.length - 1));
      setCurrentIndex(nextIdx);

      // Preload the next task's duration but keep timer stopped until user presses Start
      const secs = computeSecsForTask(nextIdx, newTasks);
      setTimeLeft(secs);
    },
    [currentIndex, tasks, computeSecsForTask, playChime]
  );

  // Timer effect using wall-clock end timestamp (persists across route changes)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!timerRunning || !timerEndTs) return;

    const tick = () => {
      const remaining = Math.round((timerEndTs - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimeLeft(0);
        // complete current task, then stop and wait for user to start next
        handleAutoComplete();
      } else {
        setTimeLeft(remaining);
      }
    };

    // initial sync
    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timerRunning, timerEndTs, handleAutoComplete]);

  const handleComplete = (idx) => {
    handleAutoComplete(idx);
  };

  const handleDelete = (idx) => {
    const newTasks = tasks.filter((_, i) => i !== idx);
    setSchedule((prev) => (prev ? { ...prev, tasks: newTasks } : { tasks: newTasks }));

    if (!newTasks.length) {
      setCurrentIndex(0);
      setTimeLeft(null);
      setTimerRunning(false);
      setTimerEndTs(null);
    } else if (idx === currentIndex) {
      const nextIdx = Math.min(idx, newTasks.length - 1);
      setCurrentIndex(nextIdx);
      const secs = computeSecsForTask(nextIdx, newTasks);
      setTimeLeft(secs);
      // timer does NOT auto-start; wait for Start button
      setTimerRunning(false);
      setTimerEndTs(null);
    } else if (idx < currentIndex) {
      // shift currentIndex back if an earlier task is removed
      const newIndex = Math.max(0, currentIndex - 1);
      setCurrentIndex(newIndex);
      const secs = computeSecsForTask(newIndex, newTasks);
      setTimeLeft(secs);
      setTimerRunning(false);
      setTimerEndTs(null);
    }
  };

  const handleNext = () => {
    handleAutoComplete();
  };

  const handleStart = () => {
    if (!tasks.length) return;
    const baseSecs =
      timeLeft != null ? timeLeft : computeSecsForTask(currentIndex);
    const end = Date.now() + baseSecs * 1000;
    setTimerEndTs(end);
    setTimerRunning(true);
  };

  const handlePause = () => {
    if (!timerRunning) return;
    if (timerEndTs) {
      const remaining = Math.max(
        0,
        Math.round((timerEndTs - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
    }
    setTimerRunning(false);
    setTimerEndTs(null);
  };

  // Open edit modal with current task values
  const toggleEdit = (idx) => {
    if (idx == null) {
      setEditingIndex(null);
      return;
    }
    const t = tasks[idx];
    if (!t) return;
    setEditingIndex(idx);
    setEditingName(t.task ?? "");
    setEditingDuration(t.duration ?? 25);
    setEditingType(t.type ?? "study");
  };

  // Save edits: name + duration + type and reset timer if editing current task
  const saveEdit = () => {
    if (editingIndex == null || !tasks[editingIndex]) {
      setEditingIndex(null);
      return;
    }

    const newTasks = [...tasks];
    const durNum = Number(editingDuration) > 0 ? Number(editingDuration) : 0;

    newTasks[editingIndex] = {
      ...newTasks[editingIndex],
      task: editingName,
      duration: durNum,
      type: editingType,
    };

    setSchedule((prev) =>
      prev ? { ...prev, tasks: newTasks } : { tasks: newTasks }
    );

    if (editingIndex === currentIndex) {
      setTimeLeft(durNum * 60);
      if (timerRunning) {
        setTimerEndTs(Date.now() + durNum * 60 * 1000);
      }
    }

    setEditingIndex(null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    const from = Number(active.id.split("-")[1]);
    const to = Number(over.id.split("-")[1]);

    if (from === to) return;

    const newTasks = arrayMove(tasks, from, to);

    setSchedule((prev) => (prev ? { ...prev, tasks: newTasks } : { tasks: newTasks }));

    const newIndex = from === currentIndex ? to : currentIndex;
    setCurrentIndex(newIndex);
    const secs = computeSecsForTask(newIndex, newTasks);
    setTimeLeft(secs);

    // do NOT auto-run the timer after drag; require user to press Start again
    setTimerRunning(false);
    setTimerEndTs(null);
  };

  if (!schedule) {
    return (
      <Box sx={{ p: 4, fontFamily: "'Bree Serif', serif", color: "primary.main" }}>
        No schedule found. Generate a schedule first.
      </Box>
    );
  }

  const items = tasks.map((_, i) => `task-${i}`);
  const currentTask = tasks[currentIndex];

  const handleCompletionClose = () =>
    setCompletionModal({ open: false, message: "" });

  return (
    <Box sx={{ fontFamily: "'Bree Serif', serif", p: 4, color: "primary.main" }}>
      {/* TIMER */}
      <Card
        sx={{
          p: 3,
          mb: 4,
          textAlign: "center",
          bgcolor: "#e3f2fd",
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <img 
          src="/src/assets/pennyturtle.png"
          alt="Penny the turtle mascot"
          style={{
            width: "100px",
            maxWidth: "150px",
            marginBottom: "0.4rem",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <Typography
          variant="h6"
          sx={{ fontSize: 30, fontFamily: "'Bree Serif', serif", color: "primary.main" }}
        >
          {currentTask?.task ?? "No active task"}
        </Typography>
        <Typography
          sx={{
            fontSize: 60,
            fontWeight: 700,
            fontFamily: "'Bree Serif', serif",
            color: "primary.main",
          }}
        >
          {timeLeft != null
            ? formatSeconds(timeLeft)
            : `${currentTask?.duration ?? 0} min`}
        </Typography>
        {currentTask && (
          <Typography
            sx={{
              mt: 1,
              fontSize: 18,
              color: "primary.main",
              fontFamily: "'Bree Serif', serif",
            }}
          >
            Duration: {currentTask.duration ?? 0} min
            {typeof currentTask.priority_score === "number" && (
              <> | Priority: {currentTask.priority_score.toFixed(1)}</>
            )}
          </Typography>
        )}
        <br />
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
          {!timerRunning ? (
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleStart}
              sx={{
                fontFamily: "'Bree Serif', serif",
                bgcolor: "#1565c0",
                "&:hover": { bgcolor: "#0f3b70" },
              }}
            >
              Start
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<PauseIcon />}
              onClick={handlePause}
              sx={{
                fontFamily: "'Bree Serif', serif",
                borderColor: "#1565c0",
                color: "#1565c0",
                "&:hover": { borderColor: "#0f3b70", color: "#0f3b70" },
              }}
            >
              Pause
            </Button>
          )}
          <Button
            variant="text"
            startIcon={<SkipNextIcon />}
            onClick={handleNext}
            sx={{
              fontFamily: "'Bree Serif', serif",
              color: "#1565c0",
              "&:hover": { color: "#0f3b70" },
            }}
          >
            Next
          </Button>
        </Stack>
      </Card>

      {/* Penny Advice */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 2 }}>
        <Typography
          sx={{
            fontStyle: "italic",
            fontSize: 18,
            fontFamily: "'Bree Serif', serif",
            color: "primary.main",
          }}
        >
          Penny’s Thoughts: {schedule.mood_advice}
        </Typography>
      </Card>

      {/* Schedule List */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontFamily: "'Bree Serif', serif",
            color: "primary.main",
          }}
        >
          Today’s Schedule
        </Typography>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <Stack spacing={2}>
              {tasks.map((t, i) => (
                <SortableTask
                  key={i}
                  id={`task-${i}`}
                  index={i}
                  task={t}
                  isActive={i === currentIndex}
                  onComplete={handleComplete}
                  onEditToggle={toggleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      </Card>

      {/* COMPLETION MODAL (Penny-style) */}
      <Modal
        open={completionModal.open}
        onClose={handleCompletionClose}
        aria-labelledby="penny-modal-title"
        aria-describedby="penny-modal-description"
        disableAutoFocus
      >
        <Box
          onClick={handleCompletionClose}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 5,
            boxShadow: 24,
            p: 5,
            width: "350px",
            height: "350px",
            textAlign: "center",
            cursor: "pointer",
            outline: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/src/assets/pennyturtle.png"
            alt="Penny the turtle mascot smiling and waving"
            style={{
              width: "65%",
              maxWidth: "240px",
              marginBottom: "0.4rem",
              marginTop: "-0.2rem",
              display: "block",
            }}
          />

          <Typography
            id="penny-modal-description"
            sx={{
              fontSize: "1.05rem",
              maxWidth: "80%",
              lineHeight: 1.6,
              mb: 1.2,
              color: "primary.main",
              fontFamily: "'Bree Serif', serif",
            }}
          >
            {completionModal.message || "let's dive in!"}
          </Typography>

          <Typography
            sx={{
              fontSize: "1rem",
              fontStyle: "italic",
              mt: 1,
              color: "primary.main",
              opacity: 0.7,
              fontFamily: "'Bree Serif', serif",
            }}
          >
            click anywhere to continue
          </Typography>
        </Box>
      </Modal>

      {/* EDIT TASK MODAL (name + duration + type) */}
      <Modal open={editingIndex != null} onClose={() => setEditingIndex(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            bgcolor: "background.paper",
            borderRadius: 5,
            p: 4,
            minWidth: 320,
          }}
        >
          <Typography
            sx={{
              mb: 2,
              fontWeight: 600,
              fontFamily: "'Bree Serif', serif",
              color: "primary.main",
            }}
          >
            Edit Task
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Task Name"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                sx: { fontFamily: "'Bree Serif', serif" },
              }}
            />
            <TextField
              label="Duration (min)"
              type="number"
              value={editingDuration}
              onChange={(e) => setEditingDuration(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                sx: { fontFamily: "'Bree Serif', serif" },
              }}
            />
            <Select
              value={editingType}
              onChange={(e) => setEditingType(e.target.value)}
              fullWidth
              size="small"
              sx={{ fontFamily: "'Bree Serif', serif" }}
            >
              <MenuItem value="study" sx={{ fontFamily: "'Bree Serif', serif" }}>
                Study
              </MenuItem>
              <MenuItem value="chores" sx={{ fontFamily: "'Bree Serif', serif" }}>
                Chores
              </MenuItem>
              <MenuItem value="work" sx={{ fontFamily: "'Bree Serif', serif" }}>
                Work
              </MenuItem>
              <MenuItem value="exercise" sx={{ fontFamily: "'Bree Serif', serif" }}>
                Exercise
              </MenuItem>
              <MenuItem value="leisure" sx={{ fontFamily: "'Bree Serif', serif" }}>
                Leisure
              </MenuItem>
              <MenuItem value="other" sx={{ fontFamily: "'Bree Serif', serif" }}>
                Other
              </MenuItem>
            </Select>
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
              <Button
                onClick={() => setEditingIndex(null)}
                sx={{ fontFamily: "'Bree Serif', serif" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={saveEdit}
                sx={{
                  fontFamily: "'Bree Serif', serif",
                  bgcolor: "#1565c0",
                  "&:hover": { bgcolor: "#0f3b70" },
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      {/* NEW: Home button */}
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/")}
          sx={{
            fontFamily: "'Bree Serif', serif",
            bgcolor: "#1565c0",
            "&:hover": { bgcolor: "#0f3b70" },
            height: 50,
            fontSize: 18,
          }}
        >
          Home
        </Button>
      </Box>

      {/* Chime audio */}
      <audio
        ref={chimeRef}
        src="/src/assets/penny-chime.mp3"  // adjust path if needed
        preload="auto"
      />
    </Box>
  );
}
