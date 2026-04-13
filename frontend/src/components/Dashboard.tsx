"use client";

import { div } from "framer-motion/client";
import * as React from "react";
import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";

const drawerWidth = 256;

interface DashboardProps {
  list: React.ReactNode;
}


export default function Dashboard({ list }: DashboardProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };


// the container of the nav bar and side bar with list passed as a props
  const drawer = (
    <div style={{ backgroundColor: "#1a2742", height: "100vh" }}>
      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            color: "orange",
            textAlign: "left",
            fontSize: "30px",
            fontWeight: "bold",
            marginTop: "20px",
            marginLeft: "20px",
          }}
        >
          NAFTAL
        </p>
        <div
          style={{
            width: "66px",
            height: "2px",
            backgroundColor: "#ffa500",
            borderRadius: "0px",
            marginLeft: "20px", 
            marginBottom: "10px", 
          }}
        ></div>
      </div>

      <Divider style={{ backgroundColor: "#d3d3d3", height: "0.01mm" }} />
      <div>
        {list}
      </div>

      <Divider />

      <div style={{ display: "flex",flexDirection: "column", alignItems: "center", marginRight: "70px", marginTop: "210px", }}>
        
          <Avatar
          sx={{
            bgcolor: "darkorange",
            color: "#222",
            width: 40,
            height: 40,
            border: "none",
            boxShadow: "none",
            fontSize: "16px",
            fontWeight: "bold",
            marginRight: "117px",
            marginBottom: "-40px",
          }}
        >
          ED
        </Avatar>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "auto",}}
        >
          <p style={{ fontSize: "15px", fontWeight: "bold" , color:"white"}}>Employe Dupont</p>
          <p
            style={{
              fontSize: "11px",
              fontWeight: "normal",
              color: "lightgray",
            }}
          >
            Employee
          </p>
        </div>

      </div>
                <ListItem disablePadding>
            <ListItemButton
              sx={{
                marginLeft:"3px",
                borderRadius: "10px",
                color: "#ffa500", // default text/icon color
                broderRadius:"1px 1px 1px 1px",
                "& .MuiListItemIcon-root": {
                  color: "#ffa500", // default icon color
                },
                "&:hover": {
                  backgroundColor: "rgba(211,211,211,0.12)", // thin gray overlay
                  color: "#fff", // text color on hover
                  "& .MuiListItemIcon-root": {
                    color: "#fff", // icon color on hover
                  },
                },
              }}
            >
              <ListItemIcon>
                <TextSnippetOutlinedIcon sx={{ fontSize: "25px" }} />
              </ListItemIcon>
              <ListItemText primary="Deconnexion" sx={{ paddingLeft:"10px"}} />
            </ListItemButton>
          </ListItem>

    </div>
  );



  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          height: "70px",
          backgroundColor: "#20314E",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <div style={{ marginRight: "20px" }}>
              <Badge
                badgeContent={3}
                color="warning"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#ffa500", // your orange
                    color: "#222", // dark text for contrast
                    fontWeight: "bold",
                    fontSize: "15px",
                    width: 18,
                    height: 18,
                    minWidth: 18,
                    top: 5,
                    right: 5,
                  },
                }}
              >
                <NotificationsNoneIcon
                  sx={{ fontSize: "30px", color: "#fff" }}
                />
              </Badge>
            </div>

            <Avatar
              sx={{
                bgcolor: "darkorange",
                color: "#222",
                width: 40,
                height: 40,
                border: "none",
                boxShadow: "none",
                fontSize: "16px",
                fontWeight: "bold",
                marginRight: "10px",
              }}
            >
              ED
            </Avatar>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "auto",
              }}
            >
              <p style={{ fontSize: "15px", fontWeight: "bold" }}>
                Employe Dupont
              </p>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "normal",
                  color: "lightgray",
                }}
              >
                Employee
              </p>
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          backgroundColor: "#12213a",
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
        }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          slotProps={{
            root: {
              keepMounted: true, 
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
      </Box>
    </Box>
  );
}
