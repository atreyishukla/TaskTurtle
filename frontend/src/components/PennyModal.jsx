import React, { useState, useEffect } from "react";
import { Modal, Box, Typography } from "@mui/material";

const PennyModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // This effect runs only once when the app first mounts.
    // If the user landed on "/", show the modal.
    if (window.location.pathname === "/") {
      setOpen(true);
    }
  }, []);

  const handleClose = () => setOpen(false);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="penny-modal-title"
      aria-describedby="penny-modal-description"
      disableAutoFocus
    >
      <Box
        onClick={handleClose}
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
          id="penny-modal-title"
          variant="h5"
          component="h2"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            fontStyle: "italic",
            mb: 1.2,
            lineHeight: 1.2,
          }}
        >
          hi! i’m penny
        </Typography>

        <Typography
          id="penny-modal-description"
          sx={{
            fontSize: "1.05rem",
            maxWidth: "80%",
            lineHeight: 1.6,
            mb: 1.2,
            color: "primary.main",
          }}
        >
          let's dive in!
        </Typography>

        <Typography
          sx={{
            fontSize: "1rem",
            fontStyle: "italic",
            mt: 1,
            color: "primary.main",
            opacity: 0.7,
          }}
        >
          click anywhere to get started
        </Typography>
      </Box>
    </Modal>
  );
};

export default PennyModal;
