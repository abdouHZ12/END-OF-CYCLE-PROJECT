"use client";

import * as React from "react";
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
import { useLogout } from "@/hooks/useLogout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import List from "@mui/material/List";

const drawerWidth = 256;


type DashboardUser = {
  initials: string;
  name: string;
  role: string;
};

interface DashboardProps {
  list?: React.ReactNode;
  children?: React.ReactNode;
  user?: DashboardUser;
  notificationsCount?: number;
  viewToggle?: React.ReactNode;
  items: {
    label: string;
    href: string;
    icon: React.ReactNode;
  }[];  
}

export default function Dashboard({
  items,
  children,
  user: userProp,
  notificationsCount = 3,
  viewToggle,
}: DashboardProps) {

  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const { logout, isLoggingOut } = useLogout();

  const defaultUser: DashboardUser = {
    initials: "ED",
    name: "Employe Dupont",
    role: "Employee",
  };

  const user = userProp ?? defaultUser;

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
    <div
      style={{
        backgroundColor: "#1a2742",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
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

      <div
        style={{
          width: "100%",
          height: "1px",
          backgroundColor: "rgba(255,255,255,0.12)",
        }}
      />
      {viewToggle && (
        <div style={{ margin: "10px 16px" }}>
          {viewToggle}
        </div>
      )}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          "& .MuiListItemButton-root:hover": {
            backgroundColor: "#ffa500 !important",
            color: "#222 !important",
          },
          "& .MuiListItemButton-root:hover .MuiListItemIcon-root": {
            color: "#222 !important",
          },
        }}
      >
          <List sx={{ color: "#fff", marginLeft: "16px", marginTop: "30px" }}>
            {items.map((item) => (
                <ListItem disablePadding key={item.href}>
                <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={pathname === item.href}
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
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                </ListItemButton>
                </ListItem>
            ))}
            </List>      
      </Box>

      <Divider />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "darkorange",
              color: "#222",
              width: 40,
              height: 40,
              fontSize: "16px",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            {user.initials}
          </Avatar>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: "15px", fontWeight: "bold", color: "white", margin: 0 }}>
              {user.name}
            </p>
            <p style={{ fontSize: "11px", color: "lightgray", margin: 0 }}>
              {user.role}
            </p>
          </div>
        </div>

        <ListItem disablePadding>
          <ListItemButton
            onClick={logout}
            disabled={isLoggingOut}
            sx={{
              marginLeft: "3px",
              borderRadius: "10px",
              color: "#ef4444",
              "& .MuiListItemIcon-root": {
                color: "#ef4444",
              },
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.14)",
                color: "#fff",
                "& .MuiListItemIcon-root": {
                  color: "#fff",
                },
              },
            }}
          >
            <ListItemIcon>
              <TextSnippetOutlinedIcon sx={{ fontSize: "25px" }} />
            </ListItemIcon>
            <ListItemText primary="Deconnexion" sx={{ paddingLeft: "10px" }} />
          </ListItemButton>
        </ListItem>
      </div>

  );

  return (
    <Box
      sx={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
        bgcolor: "#12213a",
      }}
    >
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
                badgeContent={notificationsCount}
                color="warning"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#ffa500", 
                    color: "#222",
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
              {user.initials}
            </Avatar>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "auto",
              }}
            >
              <p style={{ fontSize: "15px", fontWeight: "bold" }}>
                {user.name}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "normal",
                  color: "lightgray",
                }}
              >
                {user.role}
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
              backgroundColor: "#1a2742",
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
              backgroundColor: "#1a2742",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
        {children}
    </Box>
  );
}

