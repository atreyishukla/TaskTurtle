// src/components/CalmCatchGame.jsx
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Stack, LinearProgress } from "@mui/material";

const GAME_WIDTH = 100;  // virtual percentages
const PLAYER_WIDTH = 18;
const BALL_RADIUS = 4;
const MAX_BALLS = 3;
const SPAWN_INTERVAL_MS = 1200;
const TICK_MS = 60;
const GAME_DURATION_SECONDS = 40;

const getRandomX = () =>
  Math.random() * (100 - BALL_RADIUS * 2) + BALL_RADIUS;

export default function CalmCatchGame() {
  const [playerX, setPlayerX] = useState(50); // center
  const [balls, setBalls] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("calmCatchHighScore");
    return saved ? Number(saved) || 0 : 0;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);

  const spawnTimerRef = useRef(null);
  const loopTimerRef = useRef(null);
  const timeTimerRef = useRef(null);

  // update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("calmCatchHighScore", String(score));
    }
  }, [score, highScore]);

  const resetGame = () => {
    setBalls([]);
    setScore(0);
    setPlayerX(50);
    setTimeLeft(GAME_DURATION_SECONDS);
  };

  const startGame = () => {
    resetGame();
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseOrResume = () => {
    if (!isRunning) return;
    setIsPaused((prev) => !prev);
  };

  const movePlayer = (delta) => {
    setPlayerX((prev) => {
      const next = Math.min(
        100 - PLAYER_WIDTH / 2,
        Math.max(PLAYER_WIDTH / 2, prev + delta)
      );
      return next;
    });
  };

  // Keyboard controls: left/right arrows
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        movePlayer(-6);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        movePlayer(6);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Game loop: move balls + detect catches
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
      loopTimerRef.current = null;
      return;
    }

    loopTimerRef.current = setInterval(() => {
      setBalls((prevBalls) => {
        const newBalls = [];
        let caughtCount = 0;

        prevBalls.forEach((ball) => {
          const newY = ball.y + 1.5;
          const playerLeft = playerX - PLAYER_WIDTH / 2;
          const playerRight = playerX + PLAYER_WIDTH / 2;

          const isCaught =
            newY >= 88 &&
            newY <= 100 &&
            ball.x + BALL_RADIUS >= playerLeft &&
            ball.x - BALL_RADIUS <= playerRight;

          if (isCaught) {
            caughtCount += 1;
          } else if (newY <= 105) {
            newBalls.push({ ...ball, y: newY });
          }
        });

        if (caughtCount > 0) {
          setScore((s) => s + caughtCount);
        }
        return newBalls;
      });
    }, TICK_MS);

    return () => {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
    };
  }, [isRunning, isPaused, playerX]);

  // Ball spawner (reduced balls via MAX_BALLS)
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
      return;
    }

    spawnTimerRef.current = setInterval(() => {
      setBalls((prev) => {
        if (prev.length >= MAX_BALLS) return prev;
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: getRandomX(),
            y: -5,
          },
        ];
      });
    }, SPAWN_INTERVAL_MS);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [isRunning, isPaused]);

  // Game timer: 30 seconds limit
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (timeTimerRef.current) clearInterval(timeTimerRef.current);
      timeTimerRef.current = null;
      return;
    }

    timeTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.5) {
          // time up
          clearInterval(timeTimerRef.current);
          timeTimerRef.current = null;
          setIsRunning(false);
          setIsPaused(false);
          return 0;
        }
        return prev - 0.5;
      });
    }, 500);

    return () => {
      if (timeTimerRef.current) clearInterval(timeTimerRef.current);
    };
  }, [isRunning, isPaused]);

  const timePercent = (timeLeft / GAME_DURATION_SECONDS) * 100;
  const formattedTime = `${String(Math.floor(timeLeft))
    .padStart(2, "0")}`;

  return (
    <Box
      sx={{
        fontFamily: "'Bree Serif', serif",
        color: "primary.main",
        width: "100%",
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 1, textAlign: "center", fontFamily: "'Bree Serif', serif" }}
      >
        Calm Catch
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          textAlign: "center",
          mb: 2,
          color: "#355070",
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
        }}
      >
        Move the basket to gently catch the water bubbles before time runs out.
      </Typography>

      {/* Game area */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          aspectRatio: "3 / 2",
          borderRadius: 3,
          mx: "auto",
          mb: 2,
          overflow: "hidden",
          bgcolor: "#e3f2fd",
          boxShadow: 3,
        }}
      >
        {/* Background */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, #e8f1ff 0%, #bbd7ff 50%, #90caf9 100%)",
          }}
        />

        {/* Bubbles */}
        {balls.map((ball) => (
          <Box
            key={ball.id}
            sx={{
              position: "absolute",
              width: `${BALL_RADIUS * 2}%`,
              height: `${BALL_RADIUS * 2}%`,
              left: `calc(${ball.x}% - ${BALL_RADIUS}%)`,
              top: `${ball.y}%`,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(144,202,249,0.9))",
              border: "2px solid rgba(255,255,255,0.7)",
              boxShadow: "0 0 12px rgba(144,202,249,0.9)",
            }}
          />
        ))}

        {/* Basket */}
        <Box
          sx={{
            position: "absolute",
            bottom: "4%",
            left: `calc(${playerX}% - ${PLAYER_WIDTH / 2}%)`,
            width: `${PLAYER_WIDTH}%`,
            height: "10%",
            borderRadius: "32px 32px 12px 12px",
            bgcolor: "#0d47a1",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: "8% 10% 40% 10%",
              borderRadius: "24px 24px 10px 10px",
              border: "2px solid rgba(227,242,253,0.85)",
            }}
          />
        </Box>
      </Box>

      {/* Score + Time */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography
          sx={{
            fontFamily: "'Bree Serif', serif",
            fontSize: 16,
          }}
        >
          Score: {score}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Bree Serif', serif",
            fontSize: 14,
            color: "#355070",
          }}
        >
          Best: {highScore}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Bree Serif', serif",
            fontSize: 14,
            color: timeLeft <= 5 ? "#b71c1c" : "#355070",
          }}
        >
          Time: {formattedTime}s
        </Typography>
      </Stack>

      {/* Time bar */}
      <LinearProgress
        variant="determinate"
        value={Math.max(0, Math.min(100, timePercent))}
        sx={{
          height: 8,
          borderRadius: 4,
          mb: 2,
          bgcolor: "#e0ebff",
          "& .MuiLinearProgress-bar": {
            bgcolor: timeLeft <= 5 ? "#b71c1c" : "#1565c0",
          },
        }}
      />

      {/* Controls: movement buttons */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ mb: 1 }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={() => movePlayer(-6)}
          sx={{
            minWidth: 64,
            fontFamily: "'Bree Serif', serif",
            bgcolor: "#1565c0",
            "&:hover": { bgcolor: "#0f3b70" },
          }}
        >
          ←
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => movePlayer(6)}
          sx={{
            minWidth: 64,
            fontFamily: "'Bree Serif', serif",
            bgcolor: "#1565c0",
            "&:hover": { bgcolor: "#0f3b70" },
          }}
        >
          →
        </Button>
      </Stack>

      {/* Start / Pause / Restart */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ mt: 1 }}
      >
        {!isRunning ? (
          <Button
            variant="contained"
            onClick={startGame}
            sx={{
              fontFamily: "'Bree Serif', serif",
              bgcolor: "#1565c0",
              "&:hover": { bgcolor: "#0f3b70" },
            }}
          >
            {timeLeft <= 0 ? "Play Again" : "Start"}
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={pauseOrResume}
            sx={{
              fontFamily: "'Bree Serif', serif",
              borderColor: "#1565c0",
              color: "#1565c0",
              "&:hover": { borderColor: "#0f3b70", color: "#0f3b70" },
            }}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
        )}
      </Stack>

      <Typography
        sx={{
          mt: 1.5,
          textAlign: "center",
          fontSize: 12,
          color: "#355070",
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
        }}
      >
        Tip: you can also use your keyboard’s ← and → keys to move.
      </Typography>
    </Box>
  );
}
