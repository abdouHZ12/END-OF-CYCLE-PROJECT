"use client";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Dashboard from "../../components/Dashboard";


export default function Page() {

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

  return (
    <Dashboard list={list}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
        }}
      >
        
      </Box>
    </Dashboard>
  );
}
