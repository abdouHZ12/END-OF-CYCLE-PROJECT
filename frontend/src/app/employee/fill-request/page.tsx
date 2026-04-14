"use client"

import * as React from "react";
import { useState , useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";

export default function Page() {

    const [destination , setDestination] = React.useState<string>("") ;
    const [duration , setDuration] = React.useState<string>("") ;
    const [purpose , setPurpose] = React.useState<string>("") ;
    const [travelMethod , setTravelMethod] = React.useState<string>("") ;
    const [startDate , setStartDate] = React.useState<string>("") ;
    const [endDate , setEndDate] = React.useState<string>("") ;
    const [reason , setReason] = React.useState<string>("") ;
    const [returnTime , setReturnTime] = React.useState<string>("") ;
    const [exitTime , setExitTime] = React.useState<string>("") ;
    const [gate , setGate] = React.useState<string>("") ;
    const [isSelected, setIsSelected] = useState("ExitSlip");

    const [selected , setSelected] = React.useState<string>("exitSlip");




 return (
        <Box
          sx={{
            flexGrow: 1,
            mt: "70px", // push below navbar
            backgroundColor: "rgb(10, 22, 40)",
            display: "grid",
            gridTemplateRows: "1fr auto",
            padding: "20px",
          }}
        >
          <Box sx={{width:"100%"}}>
            <h1 style={{ fontSize: "35px", fontWeight: "bold" , color:"#fff" }}>
              New Request
            </h1>
            <p
              style={{
                fontSize: "20px ",
                color: "gray",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Submit a new authorization request
            </p>
            <Grid
              container 
              spacing={{ md: 1, lg: 1 }}
              columns={{ md: 12, lg: 12 }}
            >
              <Grid key={1} size={{ xs: 2, sm: 4, md: 4 }}>
                <Button
                  fullWidth
                  onClick={() => setIsSelected("ExitSlip")}
                  sx={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    color: isSelected === "ExitSlip" ? "#fff" : "lightgray",
                    backgroundColor:
                      isSelected === "ExitSlip" ? "#20314E" : "#1a2742", // Change background color when selected
                    borderRadius: "12px 12px 0 0",
                    borderBottom:
                      isSelected === "ExitSlip" ? "2px solid #ffa500" : "none", // Add orange border when selected
                    textTransform: "none",
                    padding: "12px 16px",
                  }}
                >
                  Exit Slip
                </Button>
              </Grid>
              <Grid key={2} size={{ xs: 2, sm: 4, md: 4 }}>
                <Button
                  fullWidth
                  onClick={() => setIsSelected("AbsenceAuthorization")}
                  sx={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    color:
                      isSelected === "AbsenceAuthorization"
                        ? "#fff"
                        : "lightgray",
                    backgroundColor:
                      isSelected === "AbsenceAuthorization"
                        ? "#20314E"
                        : "#1a2742", // Change background color when selected
                    borderRadius: "12px 12px 0 0",
                    borderBottom:
                      isSelected === "AbsenceAuthorization"
                        ? "2px solid #ffa500"
                        : "none", // Add orange border when selected
                    textTransform: "none",
                    padding: "12px 16px",
                  }}
                >
                  Absence Authorization{" "}
                </Button>
              </Grid>
              <Grid key={3} size={{ xs: 2, sm: 4, md: 4 }}>
                <Button
                  fullWidth
                  onClick={() => setIsSelected("MissionOrder")}
                  sx={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    color: isSelected === "MissionOrder" ? "#fff" : "lightgray",
                    backgroundColor:
                      isSelected === "MissionOrder" ? "#20314E" : "#1a2742", // Change background color when selected
                    borderRadius: "12px 12px 0 0",
                    borderBottom:
                      isSelected === "MissionOrder"
                        ? "2px solid #ffa500"
                        : "none", // Add orange border when selected
                    textTransform: "none",
                    padding: "12px 16px",
                  }}
                >
                  Mission Order
                </Button>
              </Grid>
            </Grid>

            {isSelected === "ExitSlip" && (
              <Grid container columns={{ md: 12, lg: 12 }} sx={{width:"100%"}}  >
                <motion.div
                  initial={{ opacity: 0, y: 20 }} // Start with opacity 0 and slightly below
                  animate={{ opacity: 1, y: 0 }} // Fade in and move to original position
                  exit={{ opacity: 0, y: 20 }} // Fade out and move slightly below
                  transition={{ duration: 0.5 }} // Animation duration
                    style={{width:"100%"}}
                >
                  <Box
                    component="form"
                    sx={{
                      padding: "24px",
                      backgroundColor: "#20314E",
                      borderRadius: "12px 12px 12px 12px",
                      marginTop: "20px ",
                      width: "100%",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <label htmlFor="" style={{ color: "#fff" }}>
                          Leave Hour *
                        </label>
                        <input
                          type="datetime-local"
                          style={{
                            width: "100%",
                            backgroundColor: "rgb(10, 22, 40)",
                            borderRadius: "5px",
                            fontSize: "16px",
                            marginTop: "2px",
                            marginBottom: "10px",
                            paddingTop: "2px",
                            paddingBottom: "8px",
                            paddingLeft: "8px",
                            paddingRight: "110px",
                            color: "#fff"
                            
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <label htmlFor="" style={{ color: "#fff" }}>Return Hour *</label>
                        <input
                          type="datetime-local"
                          style={{
                            width: "100%",
                            backgroundColor: "rgb(10, 22, 40)",
                            borderRadius: "5px",
                            fontSize: "16px",
                            marginTop: "2px",
                            marginBottom: "10px",
                            paddingTop: "2px",
                            paddingBottom: "8px",
                            paddingLeft: "8px",
                            paddingRight: "110px",
                            color:"#fff"
                          }}
                        />
                      </Grid>
                    </Grid>

                    <label htmlFor="" style={{ color: "#fff" }}>Gate  of leave *</label>
                    <br />
                    <input
                      type="text"
                      placeholder="    Gate"
                      style={{
                        width: "100%",
                        backgroundColor: "rgb(10, 22, 40)",
                        borderRadius: "5px 5px 5px 5px",
                        fontSize: "16px ",
                        marginTop: "2px",
                        marginBottom: "10px",
                        paddingTop: "5px",
                        paddingBottom: "8px",
                        color:"#fff"
                      }}
                    />

                    <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                          type="submit"
                          sx={{
                            backgroundColor: "#ffa500",
                            color: "black",
                            fontWeight: "bold",
                            padding: "12px 24px",
                            borderRadius: "8px",
                            width: "100%",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "#ffb733",
                            },
                          }}
                        >
                          Soumettre la demande
                        </Button>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                          sx={{
                            backgroundColor: "transparent",
                            color: "white",
                            fontWeight: "bold",
                            padding: "12px 24px",
                            border: "1px solid white",
                            borderRadius: "8px",
                            width: "100%",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </motion.div>
              </Grid>
            )}
            {isSelected === "AbsenceAuthorization" && (
              <Grid container>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} // Start with opacity 0 and slightly below
                  animate={{ opacity: 1, y: 0 }} // Fade in and move to original position
                  exit={{ opacity: 0, y: 20 }} // Fade out and move slightly below
                  transition={{ duration: 0.5 }} // Animation duration
                  style={{width:"100%"}}
                >
                  <Box
                    component="form"
                    sx={{
                      padding: "24px",
                      backgroundColor: "#20314E",
                      borderRadius: "12px 12px 12px 12px",
                      marginTop: "20px ",
                      width: "100%",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <label htmlFor="" style={{ color: "#fff" }}>Start Date *</label>
                        <input
                          type="date"
                          style={{
                            width: "100%",
                            backgroundColor: "rgb(10, 22, 40)",
                            borderRadius: "5px",
                            fontSize: "16px",
                            marginTop: "2px",
                            marginBottom: "10px",
                            paddingTop: "2px",
                            paddingBottom: "8px",
                            paddingLeft: "8px",
                            paddingRight: "190px",
                            color: "#fff"
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <label htmlFor="" style={{ color: "#fff" }}>End Date *</label>
                        <input
                          type="date"
                          style={{
                            width: "100%",
                            backgroundColor: "rgb(10, 22, 40)",
                            borderRadius: "5px",
                            fontSize: "16px",
                            marginTop: "2px",
                            marginBottom: "10px",
                            paddingTop: "2px",
                            paddingBottom: "8px",
                            paddingLeft: "8px",
                            paddingRight: "190px",
                            color:"#fff"
                          }}
                        />
                      </Grid>
                    </Grid>

                    <label htmlFor="" style={{ color: "#fff" }}>Absence Reason *</label>
                    <br />
                    <input
                      type="text"
                      placeholder="Please describe the Absence Reason"
                      style={{
                        width: "100%",
                        backgroundColor: "rgb(10, 22, 40)",
                        borderRadius: "5px 5px 5px 5px",
                        fontSize: "16px ",
                        marginTop: "2px",
                        marginBottom: "10px",
                        paddingTop: "8px",
                        paddingBottom: "60px",
                        paddingLeft: "8px",
                        color:"#fff"
                      }}
                    />

                    <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                          type="submit"
                          sx={{
                            backgroundColor: "#ffa500",
                            color: "black",
                            fontWeight: "bold",
                            padding: "12px 24px",
                            borderRadius: "8px",
                            width: "100%",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "#ffb733",
                            },
                          }}
                        >
                          Soumettre la demande
                        </Button>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                          sx={{
                            backgroundColor: "transparent",
                            color: "white",
                            fontWeight: "bold",
                            padding: "12px 24px",
                            border: "1px solid white",
                            borderRadius: "8px",
                            width: "100%",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </motion.div>  
              </Grid>
            )}
            {isSelected === "MissionOrder" && (
              <Grid container>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} // Start with opacity 0 and slightly below
                    animate={{ opacity: 1, y: 0 }} // Fade in and move to original position
                    exit={{ opacity: 0, y: 20 }} // Fade out and move slightly below
                    transition={{ duration: 0.5 }} // Animation duration
                    style={{width:"100%"}}

                  >
                  <Box
                    component="form"
                    sx={{
                      padding: "24px",
                      backgroundColor: "#20314E",
                      borderRadius: "12px 12px 12px 12px",
                      marginTop: "20px ",
                      width: "100%",
                    }}
                  >
                    <label htmlFor="" style={{ color: "#fff" }}>Desination *</label>
                    <br />
                    <input
                      type="text"
                      placeholder="    Ex : Alger"
                      style={{
                        width: "100%",
                        backgroundColor: "rgb(10, 22, 40)",
                        borderRadius: "5px 5px 5px 5px",
                        fontSize: "16px ",
                        marginTop: "2px",
                        marginBottom: "10px",
                        paddingTop: "2px",
                        paddingBottom: "8px",
                        color:"#fff"
                      }}
                    />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <label htmlFor="" style={{ color: "#fff" }}>Start Date *</label>
                        <input
                          type="date"
                          style={{
                            width: "100%",
                            backgroundColor: "rgb(10, 22, 40)",
                            borderRadius: "5px",
                            fontSize: "16px",
                            marginTop: "2px",
                            marginBottom: "10px",
                            paddingTop: "2px",
                            paddingBottom: "8px",
                            paddingLeft: "8px",
                            paddingRight: "190px",
                            color: "#fff"
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <label htmlFor="" style={{ color: "#fff" }}>End Date *</label>
                        <input
                          type="date"
                          style={{
                            width: "100%",
                            backgroundColor: "rgb(10, 22, 40)",
                            borderRadius: "5px",
                            fontSize: "16px",
                            marginTop: "2px",
                            marginBottom: "10px",
                            paddingTop: "2px",
                            paddingBottom: "8px",
                            paddingLeft: "8px",
                            paddingRight: "190px",
                            color: "#fff"
                          }}
                        />
                      </Grid>
                    </Grid>

                    <label htmlFor="" style={{ color: "#fff" }}>Travel Method</label>
                    <select
                      id="travel-method"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "5px",
                        backgroundColor: "rgb(10, 22, 40)",
                        color: "gray",
                      }}
                    >
                      <option value="">Sélectionner un moyen de transport</option>
                      <option value="car">Voiture</option>
                      <option value="train">Train</option>
                      <option value="plane">Avion</option>
                    </select>
                    <br />
                    <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                          type="submit"
                          sx={{
                            backgroundColor: "#ffa500",
                            color: "black",
                            fontWeight: "bold",
                            padding: "12px 24px",
                            borderRadius: "8px",
                            width: "100%",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "#ffb733",
                            },
                          }}
                        >
                          Soumettre la demande
                        </Button>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                          sx={{
                            backgroundColor: "transparent",
                            color: "white",
                            fontWeight: "bold",
                            padding: "12px 24px",
                            border: "1px solid white",
                            borderRadius: "8px",
                            width: "100%",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </motion.div>
              </Grid>
            )}
          </Box>
        </Box>
 );
}





