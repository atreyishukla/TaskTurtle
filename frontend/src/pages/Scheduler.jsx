import React, { useState, useEffect } from "react";
import { getSchedule } from "../api/schedulerAPI";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Card,
  IconButton,
  Grid,
  Stack,
  Modal,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import PennyModal from "../components/PennyModal";

export default function Schedule() {
  const [tasks, setTasks] = useState(
    () => JSON.parse(localStorage.getItem("tasks")) || []
  );
  const [newTask, setNewTask] = useState({
    name: "",
    duration: 30,
    difficulty: 3,
    type: "study",
  });
  const [mood, setMood] = useState("ok");

  // for modal editing (like ScheduleView)
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingDuration, setEditingDuration] = useState("");
  const [editingType, setEditingType] = useState("study");

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.name) return;
    setTasks([
      ...tasks,
      {
        ...newTask,
        duration: Number(newTask.duration),
        difficulty: Number(newTask.difficulty),
      },
    ]);
    setNewTask({ name: "", duration: 30, difficulty: 3, type: "study" });
  };

  const deleteTask = (index) =>
    setTasks(tasks.filter((_, i) => i !== index));

  // Open edit modal with current task values
  const openEditModal = (index) => {
    const t = tasks[index];
    if (!t) return;
    setEditingIndex(index);
    setEditingName(t.name ?? "");
    setEditingDuration(t.duration ?? 30);
    setEditingType(t.type ?? "study");
  };

  // Save edits from modal
  const saveEdit = () => {
    if (editingIndex == null || !tasks[editingIndex]) {
      setEditingIndex(null);
      return;
    }

    const updated = [...tasks];
    const durNum = Number(editingDuration) > 0 ? Number(editingDuration) : 0;

    updated[editingIndex] = {
      ...updated[editingIndex],
      name: editingName,
      duration: durNum,
      type: editingType,
    };

    setTasks(updated);
    setEditingIndex(null);
  };

  const runModel = async () => {
    const schedule = await getSchedule(tasks, mood);

    // Convert minutes to HH:MM for frontend display
    const tasksWithTime = schedule.tasks.map((t) => {
      const startHour = Math.floor(t.start_minute / 60);
      const startMin = t.start_minute % 60;
      const endHour = Math.floor(t.end_minute / 60);
      const endMin = t.end_minute % 60;

      const duration = t.end_minute - t.start_minute; // duration in minutes

      return {
        ...t,
        duration,
        start_time: `${String(startHour).padStart(2, "0")}:${String(
          startMin
        ).padStart(2, "0")}`,
        end_time: `${String(endHour).padStart(2, "0")}:${String(
          endMin
        ).padStart(2, "0")}`,
      };
    });

    // 🔹 RESET TIMER STATE whenever a new schedule is generated
    localStorage.removeItem("sv_currentIndex");
    localStorage.removeItem("sv_timeLeft");
    localStorage.removeItem("sv_timerRunning");
    localStorage.removeItem("sv_timerEndTs");

    // Save the new schedule
    localStorage.setItem(
      "schedule",
      JSON.stringify({
        tasks: tasksWithTime,
        mood_advice: schedule.mood_advice,
      })
    );

    navigate("/schedule");
  };

  return (
    <Box
      sx={{
        fontFamily: "'Bree Serif', serif",
        minHeight: "100vh",
        p: 4,
        color: "#1565c0",
      }}
    >
      
     
      {/* ADD TASK SECTION */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: "white",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontFamily: "'Bree Serif', serif",
            color: "#1565c0",
          }}
        >
          Tasks
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Task Name"
              value={newTask.name}
              onChange={(e) =>
                setNewTask({ ...newTask, name: e.target.value })
              }
              fullWidth
              size="small"
              InputLabelProps={{
                sx: { fontFamily: "'Bree Serif', serif" },
              }}
              InputProps={{
                sx: { fontFamily: "'Bree Serif', serif" },
              }}
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField
              label="Duration (min)"
              type="number"
              value={newTask.duration}
              onChange={(e) =>
                setNewTask({ ...newTask, duration: e.target.value })
              }
              fullWidth
              size="small"
              InputLabelProps={{
                sx: { fontFamily: "'Bree Serif', serif" },
              }}
              InputProps={{
                sx: { fontFamily: "'Bree Serif', serif" },
              }}
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField
              label="Difficulty (1-5)"
              type="number"
              value={newTask.difficulty}
              onChange={(e) =>
                setNewTask({ ...newTask, difficulty: e.target.value })
              }
              fullWidth
              size="small"
              InputLabelProps={{
                sx: { fontFamily: "'Bree Serif', serif" },
              }}
              InputProps={{
                sx: { fontFamily: "'Bree Serif', serif" },
              }}
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <Select
              value={newTask.type}
              onChange={(e) =>
                setNewTask({ ...newTask, type: e.target.value })
              }
              fullWidth
              size="small"
              sx={{fontFamily: "'Bree Serif', serif",}}
            >
              <MenuItem
                value="study"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Study
              </MenuItem>
              <MenuItem
                value="chores"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Chores
              </MenuItem>
              <MenuItem
                value="work"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Work
              </MenuItem>
              <MenuItem
                value="exercise"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Exercise
              </MenuItem>
              <MenuItem
                value="leisure"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Leisure
              </MenuItem>
              <MenuItem
                value="other"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Other
              </MenuItem>
            </Select>
          </Grid>

          <Grid item xs={6} sm={2}>
            <Button
              variant="contained"
              onClick={addTask}
              fullWidth
              sx={{
                fontFamily: "'Bree Serif', serif",
                bgcolor: "#1565c0",
                "&:hover": { bgcolor: "#0f3b70" },
              }}
            >
              Add Task
            </Button>
          </Grid>
        </Grid>

        {/* TASK LIST */}
        <Stack spacing={2} sx={{ mt: 3 }}>
          {tasks.map((t, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.2,
                borderRadius: 2,
                bgcolor: "#f0f4ff",
              }}
            >
              <Box sx={{ flexGrow: 1, pr: 1 }}>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontFamily: "'Bree Serif', serif",
                    color: "#1e3a5f",
                  }}
                >
                  {t.name} | {t.duration} min | Difficulty: {t.difficulty} | Type:{" "}
                  {t.type}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton
                  color="info"
                  onClick={() => openEditModal(i)}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => deleteTask(i)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>
      </Card>

      {/* MOOD SELECTOR */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: 2,
          bgcolor: "white",
        }}
      >
        <Typography
          sx={{
            mb: 1,
            fontFamily: "'Bree Serif', serif",
            color: "#1565c0",
          }}
        >
          Mood:
        </Typography>
        <Select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          fullWidth
          size="small"
          sx={{
            fontFamily: "'Bree Serif', serif",
          }}
        >
          <MenuItem
            value="tired"
            sx={{fontFamily: "'Bree Serif', serif",}}
          >
            Tired
          </MenuItem>
          <MenuItem
            value="ok"
            sx={{fontFamily: "'Bree Serif', serif",}}
          >
            Neutral
          </MenuItem>
          <MenuItem
            value="motivated"
            sx={{fontFamily: "'Bree Serif', serif",}}
          >
            Motivated
          </MenuItem>
          <MenuItem
            value="stressed"
            sx={{fontFamily: "'Bree Serif', serif",}}
          >
            Stressed
          </MenuItem>
          <MenuItem
            value="anxious"
            sx={{fontFamily: "'Bree Serif', serif",}}
          >
            Anxious
          </MenuItem>
          <MenuItem
            value="overwhelmed"
            sx={{fontFamily: "'Bree Serif', serif",}}
          >
            Overwhelmed
          </MenuItem>
          <MenuItem
            value="relaxed"
            sx={{fontFamily: "'Bree Serif', serif",}}
          >
            Relaxed
          </MenuItem>
        </Select>
      </Card>

      <Button
        variant="contained"
        fullWidth
        onClick={runModel}
        sx={{
          fontFamily: "'Bree Serif', serif",
          bgcolor: "#1565c0",
          "&:hover": { bgcolor: "#0f3b70" },
          height: 50,
          fontSize: 18,
        }}
      >
        Generate Schedule
      </Button>

      {/* EDIT TASK MODAL (name + duration + type) */}
      <Modal
        open={editingIndex != null}
        onClose={() => setEditingIndex(null)}
      >
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
              InputLabelProps={{
                sx: { fontFamily: "'Bree Serif', serif" },
              }}
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
              InputLabelProps={{
                sx: { fontFamily: "'Bree Serif', serif" },
              }}
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
              <MenuItem
                value="study"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Study
              </MenuItem>
              <MenuItem
                value="chores"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Chores
              </MenuItem>
              <MenuItem
                value="work"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Work
              </MenuItem>
              <MenuItem
                value="exercise"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Exercise
              </MenuItem>
              <MenuItem
                value="leisure"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Leisure
              </MenuItem>
              <MenuItem
                value="other"
                sx={{fontFamily: "'Bree Serif', serif",}}
              >
                Other
              </MenuItem>
            </Select>

            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              sx={{ mt: 1 }}
            >
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
    </Box>
  );
}
