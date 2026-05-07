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
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import { useLogout } from "@/hooks/useLogout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import List from "@mui/material/List";
import NotificationPanel from "@/components/NotificationPanel";
import ThemeToggle from "@/components/theme/ThemeToggle";

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

  const drawer = (
    <div
      style={{
        backgroundColor: "var(--naftal-surface-1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            color: "var(--naftal-brand)",
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
            backgroundColor: "var(--naftal-brand)",
            borderRadius: "0px",
            marginLeft: "20px",
            marginBottom: "10px",
          }}
        />
      </div>

      <div
        style={{
          width: "100%",
          height: "1px",
          backgroundColor: "var(--naftal-border-subtle)",
        }}
      />

      {viewToggle && (
        <div style={{ margin: "10px 16px" }}>
          {viewToggle}
        </div>
      )}

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <List sx={{ color: "var(--naftal-text-primary)", marginLeft: "16px", marginTop: "30px" }}>
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <ListItem disablePadding key={item.href}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive}
                  sx={{
                    marginRight: "16px",
                    borderRadius: "10px",
                    backgroundColor: isActive ? "var(--naftal-brand)" : "transparent",
                    color: isActive ? "var(--naftal-on-brand)" : "var(--naftal-text-secondary)",
                    "& .MuiListItemIcon-root": {
                      color: isActive ? "var(--naftal-on-brand)" : "var(--naftal-text-secondary)",
                    },
                    "&:hover": {
                      backgroundColor: isActive
                        ? "var(--naftal-brand-hover)"
                        : "var(--naftal-hover)",
                      color: isActive ? "var(--naftal-on-brand)" : "var(--naftal-text-primary)",
                      "& .MuiListItemIcon-root": {
                        color: isActive ? "var(--naftal-on-brand)" : "var(--naftal-text-primary)",
                      },
                    },
                    "&.Mui-selected": {
                      backgroundColor: "var(--naftal-brand)",
                      color: "var(--naftal-on-brand)",
                      "& .MuiListItemIcon-root": {
                        color: "var(--naftal-on-brand)",
                      },
                      "&:hover": {
                        backgroundColor: "var(--naftal-brand-hover)",
                      },
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: "var(--naftal-border-subtle)" }} />

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
            bgcolor: "var(--naftal-brand-strong)",
            color: "var(--naftal-on-brand)",
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
          <p style={{ fontSize: "15px", fontWeight: "bold", color: "var(--naftal-text-primary)", margin: 0 }}>
            {user.name}
          </p>
          <p style={{ fontSize: "11px", color: "var(--naftal-text-secondary)", margin: 0 }}>
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
            color: "var(--naftal-error)",
            "& .MuiListItemIcon-root": {
              color: "var(--naftal-error)",
            },
            "&:hover": {
              backgroundColor: "var(--naftal-error-muted)",
              color: "var(--naftal-error)",
              "& .MuiListItemIcon-root": {
                color: "var(--naftal-error)",
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
        bgcolor: "var(--naftal-bg)",
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          height: "70px",
          backgroundColor: "var(--naftal-surface-3)", // ← surface-3 not surface-1
          borderBottom: "1px solid var(--naftal-border)", // ← border not border-subtle
          color: "var(--naftal-text-primary)",
        }}
      >
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
              color: "var(--naftal-text-primary)",
            }}
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
            <div style={{ marginRight: "16px" }}>
              <NotificationPanel />
            </div>
            <div style={{ marginRight: "16px" }}>
              <ThemeToggle />
            </div>

            <Avatar
              sx={{
                bgcolor: "var(--naftal-brand-strong)",
                color: "var(--naftal-on-brand)",
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

            <div style={{ display: "flex", flexDirection: "column" }}>
              <p style={{ fontSize: "15px", fontWeight: "bold", color: "var(--naftal-text-primary)", margin: 0 }}>
                {user.name}
              </p>
              <p style={{ fontSize: "11px", fontWeight: "normal", color: "var(--naftal-text-secondary)", margin: 0 }}>
                {user.role}
              </p>
            </div>
          </div>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
        }}
        aria-label="navigation"
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
              backgroundColor: "var(--naftal-surface-1)",
              borderRight: "1px solid var(--naftal-border)",
              boxShadow: "var(--naftal-shadow-soft)",
            },
          }}
          slotProps={{ root: { keepMounted: true } }}
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
              backgroundColor: "var(--naftal-surface-1)",
              borderRight: "1px solid var(--naftal-border)", // ← border not border-subtle
              boxShadow: "var(--naftal-shadow-soft)",        // ← adds depth separation
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