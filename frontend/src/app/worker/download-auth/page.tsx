"use client"

import {useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Stack from "@mui/material/Stack";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { apiGet , type ApiError} from "@/lib/api";
import {type DocumentResponse , type Document , gettype , getStatusChip} from "../page";


import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";





export default function Page() {





return(
        <Box
          sx={{
            flexGrow: 1,
            mt: "70px", // push below navbar
            backgroundColor: "rgb(10, 22, 40)",
            display: "grid",
            gridTemplateRows: "1fr auto",
            padding: "36px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Box sx={{width:"100% ", height: "100%"}}>
            <h1 style={{ fontSize: "35px", fontWeight: "bold" , color:"#fff" }}>
              Dashboard
            </h1>
            <p
              style={{
                fontSize: "20px ",
                color: "gray",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Welcome to your dashboard
            </p>
          </Box>  
         </Box> 
)}         