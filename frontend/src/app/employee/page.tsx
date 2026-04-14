"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Dashboard from "../../components/Dashboard";

const drawerWidth = 256;

export default function Page() {


  // the list of the sidebar

  const list = (
    <List sx={{ color: "#fff", marginLeft: "16px", marginTop: "30px" }}>
      <ListItem disablePadding>
        <ListItemButton
          sx={{
            marginRight: "16px",
            borderRadius: "10px",
            color: "lightgray", // how to set default text/icon color
            "& .MuiListItemIcon-root": {
              color: "lightgray", // how to set default default icon color
            },
            "&:hover": {
              backgroundColor: "rgba(211,211,211,0.12)",
              color: "white", // text color on hover
              "& .MuiListItemIcon-root": {
                color: "#fff", // icon color on hover
              },
            },
          }}
        >
          <ListItemIcon>
            <DashboardOutlinedIcon sx={{ fontSize: "25px" }} />
          </ListItemIcon>
          <ListItemText primary="Tableau de bord" />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding>
        <ListItemButton
          sx={{
            marginRight: "16px",
            borderRadius: "10px",
            color: "lightgray", // default text/icon color
            "& .MuiListItemIcon-root": {
              color: "lightgray", // default icon color
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
          <ListItemText primary="Nouvelle demande" />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding>
        <ListItemButton
          sx={{
            marginRight: "16px",
            borderRadius: "10px",
            color: "lightgray", // default text/icon color
            "& .MuiListItemIcon-root": {
              color: "lightgray", // default icon color
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
            <AssignmentOutlinedIcon sx={{ fontSize: "25px" }} />
          </ListItemIcon>
          <ListItemText primary="Mes demandes" />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding>
        <ListItemButton
          sx={{
            marginRight: "16px",
            borderRadius: "10px",
            color: "lightgray", // default text/icon color
            "& .MuiListItemIcon-root": {
              color: "lightgray", // default icon color
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
            <RestoreOutlinedIcon sx={{ fontSize: "25px" }} />
          </ListItemIcon>
          <ListItemText primary="Historique" />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding>
        <ListItemButton
          sx={{
            marginRight: "16px",
            borderRadius: "10px",
            color: "lightgray", // default text/icon color
            "& .MuiListItemIcon-root": {
              color: "lightgray", // default icon color
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
            <FileDownloadOutlinedIcon sx={{ fontSize: "25px" }} />
          </ListItemIcon>
          <ListItemText primary="Telecharger autorisation" />
        </ListItemButton>
      </ListItem>
    </List>
  );

  const header = (
    <AppBar
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        height: "70px",
        backgroundColor: "#20314E",
      }}
    >
      <Toolbar>
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
              <NotificationsNoneIcon sx={{ fontSize: "30px", color: "#fff" }} />
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
  );

  return (
    <Box style={{ display: "flex", height: "100vh" }}>
      <Dashboard list={list} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "row" }}>
        {header}

      </Box>
    </Box>
  );
}
