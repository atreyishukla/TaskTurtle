// src/components/TurtleStackGame.jsx
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";

const GAME_KEY = "turtleStackHighScore";

const loadHighScore = () => {
  try {
    const v = localStorage.getItem(GAME_KEY);
    return v ? Number(v) || 0 : 0;
  } catch {
    return 0;
  }
};

const saveHighScore = (score) => {
  try {
    localStorage.setItem(GAME_KEY, String(score));
  } catch {}
};

export default function TurtleStackGame() {
  const [stack, setStack] = useState([{ width: 80, x: 50 }]); // base block
  const [current, setCurrent] = useState({ width: 80, x: 50, dir: 1 });
  const [running, setRunning] = useState(false); // game started
  const [paused, setPaused] = useState(false); // pause/resume flag
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(loadHighScore);
  const [gameOver, setGameOver] = useState(false);

  const loopRef = useRef(null);

  const resetGame = () => {
    setStack([{ width: 80, x: 50 }]);
    setCurrent({ width: 80, x: 50, dir: 1 });
    setRunning(false);
    setPaused(false);
    setScore(0);
    setGameOver(false);
  };

  const startGame = () => {
    resetGame();
    setRunning(true);
    setPaused(false);
  };

  const togglePause = () => {
    if (!running || gameOver) return;
    setPaused((p) => !p);
  };

  // Move current block left/right (same speed as original)
  useEffect(() => {
    if (!running || paused || gameOver) {
      if (loopRef.current) clearInterval(loopRef.current);
      loopRef.current = null;
      return;
    }

    loopRef.current = setInterval(() => {
      setCurrent((c) => {
        const speed = 1.2; // original speed
        let nextX = c.x + c.dir * speed;
        let nextDir = c.dir;

        if (nextX > 90) {
          nextX = 90;
          nextDir = -1;
        }
        if (nextX < 10) {
          nextX = 10;
          nextDir = 1;
        }

        return { ...c, x: nextX, dir: nextDir };
      });
    }, 16);

    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [running, paused, gameOver]);

  const dropBlock = () => {
    if (!running || paused || gameOver) return;

    const topBlock = stack[stack.length - 1];
    const newCenter = current.x;

    const overlap =
      Math.min(
        topBlock.x + topBlock.width / 2,
        newCenter + current.width / 2
      ) -
      Math.max(
        topBlock.x - topBlock.width / 2,
        newCenter - current.width / 2
      );

    // 🔹 Use original difficulty logic: small overlap = game over
    if (overlap <= 8) {
      setRunning(false);
      setPaused(false);
      setGameOver(true);
      setHighScore((prev) => {
        if (score > prev) {
          saveHighScore(score);
          return score;
        }
        return prev;
      });
      return;
    }

    const newWidth = Math.max(20, overlap); // keep original minimum size
    const leftEdge = Math.max(
      topBlock.x - topBlock.width / 2,
      newCenter - current.width / 2
    );
    const newX = leftEdge + newWidth / 2;

    setStack((prev) => [...prev, { width: newWidth, x: newX }]);
    setScore((s) => s + 1);
    setCurrent((c) => ({ ...c, width: newWidth }));
  };

  // 🔹 Camera / scrolling: shift everything up after ~15 blocks
  const visibleLayers = 14;
  const overflowLayers = Math.max(0, stack.length - visibleLayers);
  const baseOffset = 10 - overflowLayers * 20; 

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 420,
        mx: "auto",
        p: 2,
        color: "primary.main",
        fontFamily: "'Bree Serif', serif",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'Bree Serif', serif",
          textAlign: "center",
          mb: 1,
        }}
      >
        Turtle Stack
      </Typography>

      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontFamily: "'Bree Serif', serif",
          }}
        >
          Stack: {score}
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            fontFamily: "'Bree Serif', serif",
          }}
        >
          Best: {highScore}
        </Typography>
      </Stack>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          height: 260,
          mx: "auto",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#e3f2fd",
          border: "2px solid #1565c0",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          pb: 1,
        }}
        onClick={running && !paused && !gameOver ? dropBlock : undefined}
      >
        {/* stack blocks */}
        {stack.map((b, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              bottom: baseOffset + index * 16,
              left: `${b.x}%`,
              width: `${b.width}%`,
              height: 14,
              bgcolor: index === 0 ? "#1565c0" : "#64b5f6",
              transform: "translateX(-50%)",
              borderRadius: 1,
              boxShadow: 1,
            }}
          />
        ))}

        {/* moving block */}
        {running && !gameOver && (
          <Box
            sx={{
              position: "absolute",
              bottom: baseOffset + stack.length * 16,
              left: `${current.x}%`,
              width: `${current.width}%`,
              height: 14,
              bgcolor: "#1e88e5",
              transform: "translateX(-50%)",
              borderRadius: 1,
              boxShadow: 2,
              opacity: paused ? 0.6 : 1,
            }}
          />
        )}

        {/* little turtle at base (scrolls with the stack / camera) */}
        <Box
          sx={{
            position: "absolute",
            bottom: baseOffset - 10, // keep relative to base block
            left: "50%",
            transform: "translateX(-50%)",
            width: 40,
            height: 16,
            bgcolor: "#2e7d32",
            borderRadius: "16px 16px 8px 8px",
            mb: 0.5,
          }}
        />
      </Box>

      <Typography
        sx={{
          mt: 1,
          fontSize: 12,
          textAlign: "center",
          opacity: 0.8,
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
        }}
      >
        Tap inside the game area to drop the block.
      </Typography>

      <Stack
        direction="row"
        justifyContent="center"
        spacing={1.5}
        sx={{ mt: 2 }}
      >
        {!running ? (
          <Button
            variant="contained"
            onClick={startGame}
            sx={{
              fontFamily: "'Bree Serif', serif",
              bgcolor: "#1565c0",
              "&:hover": { bgcolor: "#0f3b70" },
            }}
          >
            {gameOver ? "Play Again" : "Start"}
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={togglePause}
            sx={{
              fontFamily: "'Bree Serif', serif",
              borderColor: "#1565c0",
              color: "#1565c0",
              "&:hover": { borderColor: "#0f3b70", color: "#0f3b70" },
            }}
          >
            {paused ? "Resume" : "Pause"}
          </Button>
        )}

        <Button
          variant="outlined"
          onClick={resetGame}
          sx={{
            fontFamily: "'Bree Serif', serif",
            borderColor: "#1565c0",
            color: "#1565c0",
            "&:hover": { borderColor: "#0f3b70", color: "#0f3b70" },
          }}
        >
          Reset
        </Button>
      </Stack>
    </Box>
  );
}
