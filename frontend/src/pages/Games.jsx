// src/pages/Games.jsx
import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  Modal,
} from "@mui/material";
import CalmCatchGame from "../components/CalmCatchGame";
import TurtleStackGame from "../components/TurtleStackGame";

export default function Games() {
  const [openGame, setOpenGame] = useState(null); // "calm" | "stack" | null

  const handleOpen = (gameKey) => setOpenGame(gameKey);
  const handleClose = () => setOpenGame(null);

  return (
    <Box
      sx={{
        fontFamily: "'Bree Serif', serif",
        minHeight: "100vh",
        p: 4,
        color: "primary.main",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 1,
          textAlign: "center",
          fontFamily: "'Bree Serif', serif",
          color: "#1565c0",
        }}
      >
        Games Den
      </Typography>
      <Typography
        sx={{
          textAlign: "center",
          mb: 4,
          fontSize: 14,
          color: "#355070",
        }}
      >
        Take a gentle pause with mini games designed to keep your mind light but
        focused.
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        justifyContent="center"
      >
        {/* Calm Catch card */}
        <Card
          sx={{
            flex: 1,
            maxWidth: 360,
            mx: "auto",
            p: 3,
            borderRadius: 3,
            boxShadow: 3,
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              fontFamily: "'Bree Serif', serif",
              color: "#1565c0",
            }}
          >
            Calm Catch
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              mb: 2,
              color: "#355070",
              fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
            }}
          >
            Catch falling bubbles with your basket. Simple, soothing, and great
            for short breaks.
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleOpen("calm")}
            sx={{
              mt: 1,
              fontFamily: "'Bree Serif', serif",
              bgcolor: "#1565c0",
              "&:hover": { bgcolor: "#0f3b70" },
            }}
            fullWidth
          >
            Play Calm Catch
          </Button>
        </Card>

        {/* Turtle Stack card */}
        <Card
          sx={{
            flex: 1,
            maxWidth: 360,
            mx: "auto",
            p: 3,
            borderRadius: 3,
            boxShadow: 3,
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              fontFamily: "'Bree Serif', serif",
              color: "#1565c0",
            }}
          >
            Turtle Stack
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              mb: 2,
              color: "#355070",
              fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
            }}
          >
            Time your taps to stack drifting shells into a tall, steady tower.
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleOpen("stack")}
            sx={{
              mt: 1,
              fontFamily: "'Bree Serif', serif",
              bgcolor: "#1565c0",
              "&:hover": { bgcolor: "#0f3b70" },
            }}
            fullWidth
          >
            Play Turtle Stack
          </Button>
        </Card>
      </Stack>

      {/* Modals */}
      <Modal
        open={openGame === "calm"}
        onClose={handleClose}
        aria-labelledby="calm-catch-modal-title"
        disableAutoFocus
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "95%",
            maxWidth: 480,
            bgcolor: "background.paper",
            borderRadius: 4,
            boxShadow: 24,
            p: 3,
            outline: "none",
          }}
        >
          <CalmCatchGame />

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              onClick={handleClose}
              sx={{
                fontFamily: "'Bree Serif', serif",
                color: "#1565c0",
                "&:hover": { color: "#0f3b70" },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openGame === "stack"}
        onClose={handleClose}
        aria-labelledby="turtle-stack-modal-title"
        disableAutoFocus
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "95%",
            maxWidth: 480,
            bgcolor: "background.paper",
            borderRadius: 4,
            boxShadow: 24,
            p: 3,
            outline: "none",
          }}
        >
          <TurtleStackGame />

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              onClick={handleClose}
              sx={{
                fontFamily: "'Bree Serif', serif",
                color: "#1565c0",
                "&:hover": { color: "#0f3b70" },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
