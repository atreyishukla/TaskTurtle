// components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemText, Box } from "@mui/material";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { text: "Schedule", path: "/schedule" },
    { text: "Games", path: "/games" },
  ];

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box onClick={toggleDrawer} sx={{ width: 250, fontFamily: "'Bree Serif', serif" }}>
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: "linear-gradient(90deg, #1565c0, #1e88e5)",
          padding: { xs: "5px 10px", sm: "10px 20px" },
          fontFamily: "'Bree Serif', serif",
        }}
      >
        <Toolbar>
          {/* Brand */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "white",
              fontWeight: "bold",
              letterSpacing: "0.5px",
              fontFamily: "'Bree Serif', serif",
              fontSize: 30
            }}
          >
            TaskTurtle
          </Typography>

          {/* Desktop Links */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  fontSize: 16,
                  color: "white",
                  fontWeight: 500,
                  ml: 2,
                  borderBottom:
                    location.pathname === item.path ? "2px solid white" : "none",
                  borderRadius: 0,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  fontFamily: "'Bree Serif', serif",
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <Button
              variant="outlined"
              sx={{
                color: "white",
                borderColor: "white",
                fontFamily: "'Bree Serif', serif",
              }}
              onClick={toggleDrawer}
            >
              Menu
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>

      {/* Spacer */}
      <Toolbar />
    </>
  );
};

export default Navbar;
