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
import InboxIcon from "@mui/icons-material/MoveToInbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
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

  const [isSelected, setIsSelected] = useState(false);


// the list of the sidebar

const list =(
        <List style={{ color: "#fff", marginLeft: "16px", marginTop: "30px" }}>
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
)


  return (
    <div>
      <Dashboard list={list} />
    </div>
  );
}
