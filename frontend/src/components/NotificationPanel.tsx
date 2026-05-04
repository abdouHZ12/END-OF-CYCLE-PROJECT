"use client";

import * as React from "react";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

const TYPE_LABELS: Record<Notification["type"], string> = {
  NEW_PENDING_DOCUMENT: "New Request",
  DOCUMENT_APPROVED: "Approved",
  DOCUMENT_REJECTED: "Rejected",
  DOCUMENT_EXPIRING: "Expiring Soon",
};

const TYPE_COLORS: Record<Notification["type"], string> = {
  NEW_PENDING_DOCUMENT: "#ffa500",
  DOCUMENT_APPROVED: "#22c55e",
  DOCUMENT_REJECTED: "#ef4444",
  DOCUMENT_EXPIRING: "#f97316",
};

export default function NotificationPanel() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const { notifications, unreadCount, markOneAsRead, markAllAsRead } = useNotifications();

  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleClickNotification = (n: Notification) => {
    if (!n.read) markOneAsRead(n.id);
  };

  return (
    <>
      {/* Bell icon — drop this wherever needed */}
      <IconButton onClick={handleOpen} sx={{ p: 0 }}>
        <Badge
          badgeContent={unreadCount}
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#ffa500",
              color: "#222",
              fontWeight: "bold",
              fontSize: "11px",
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
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#1a2742",
              color: "#fff",
              width: 360,
              maxHeight: 480,
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              mt: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: "bold", fontSize: "16px" }}>
            Notifications
            {unreadCount > 0 && (
              <Typography component="span" sx={{ ml: 1, fontSize: "12px", color: "#ffa500" }}>
                ({unreadCount} unread)
              </Typography>
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              size="small"
              startIcon={<CheckCircleIcon sx={{ fontSize: "14px" }} />}
              sx={{ color: "#ffa500", fontSize: "11px", textTransform: "none", p: 0, minWidth: 0 }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* List */}
        <Box sx={{ overflowY: "auto", maxHeight: 380 }}>
          {notifications.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <NotificationsNoneIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.2)", mb: 1 }} />
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            notifications.map((n) => (
              <Box
                key={n.id}
                onClick={() => handleClickNotification(n)}
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  backgroundColor: n.read ? "transparent" : "rgba(255,165,0,0.06)",
                  borderLeft: n.read ? "3px solid transparent" : `3px solid ${TYPE_COLORS[n.type]}`,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
                  transition: "background 0.2s",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: TYPE_COLORS[n.type],
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {TYPE_LABELS[n.type]}
                  </Typography>
                  {!n.read && (
                    <FiberManualRecordIcon sx={{ fontSize: "8px", color: "#ffa500", ml: "auto" }} />
                  )}
                </Box>
                <Typography sx={{ fontSize: "13px", color: "#e2e8f0", lineHeight: 1.4 }}>
                  {n.message}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", mt: 0.5 }}>
                  {new Date(n.createdAt).toLocaleString("fr-DZ", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Popover>
    </>
  );
}