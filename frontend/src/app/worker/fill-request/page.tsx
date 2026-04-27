"use client"

import * as React from "react";
import { useState  } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import { useRef } from "react";
import { apiPost, type ApiError } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {useRouter} from "next/navigation" ;


type DocumentResponse ={
	message?: string;
  document :{
    id : number ;
    type : string ;
    status : string ;
  }
};
export default function Page() {


      const [startDate , setStartDate] = React.useState<string>("") ;
      const [endDate , setEndDate] = React.useState<string>("") ;
      const [reason , setReason] = React.useState<string>("") ;

      const [returnTime , setReturnTime] = React.useState<string>("") ;
      const [exitTime , setExitTime] = React.useState<string>("") ;
      const [gate , setGate] = React.useState<string>("") ;

      const [isLoading, setIsLoading] = useState(false) ;
      const [error, setError] = useState<string | null>(null) ;
      const [toast , setToast] = useState<string | null>(null) ;
      const [isSelected, setIsSelected] = useState("ExitSlip");

      const toastTimerRef = useRef<number | null>(null) ;
      
      
      const user = useCurrentUser();
      const employeeId = user ? Number(user.id) : null;



      async function handleExitSlipSubmit (e:React.FormEvent) {
        e.preventDefault() ;
        if (!employeeId) {
          setError("Please sign in");
          return;
        }
        setIsLoading(true) ;
        setError(null) ;

        try {
          await apiPost<DocumentResponse>("/api/documents/ExitSlip" , {
            Type : "EXIT_SLIP" , 
            EmployeeId : employeeId ,
            exitTime : new Date(exitTime) ,
            returnTime : new Date(returnTime) ,
            gate
        }) ; 

        showToast("Exit Slip created succefully" , 2500) ;

        setExitTime("");
        setReturnTime("");
        setGate("");
      } catch (err :unknown) {
        const apiErr = err as ApiError ;
        setError(
          apiErr?.message || "An error occurred while submitting the exit slip" ) ;

      } finally {
        setIsLoading(false);
      }
    }

      async function handleAbsenceAuthorizationSubmit (e:React.FormEvent){
        e.preventDefault() ;
        if (!employeeId) {
          setError("Please sign in");
          return;
        }
        setIsLoading(true) ;
        setError(null) ;

          try {
          await apiPost<DocumentResponse>("/api/documents/AbsenceAuth" , {
            Type : "ABSENCE_AUTH" , 
            EmployeeId : employeeId ,
            startDate : new Date(startDate) ,
            endDate : new Date(endDate) ,
            reason
        }) ; 

        showToast("Absence Authorization created succefully" , 2500) ;

        setStartDate("");
        setEndDate("");
        setReason("");

      } catch (err :unknown) {
        const apiErr = err as ApiError ;
        setError(
          apiErr?.message || "An error occurred while submitting the absence authorization" ) ;

      } finally {
        setIsLoading(false);
      }

      }

      const router = useRouter() ;
      const handleCancel = () => {
        router.push("/worker") ;
        console.log("Request Cancelled");
      }

      

      function showToast(message: string, durationMs: number) {
        if (toastTimerRef.current) {
          window.clearTimeout(toastTimerRef.current);
          toastTimerRef.current = null;
        }
        setToast(message);
        toastTimerRef.current = window.setTimeout(() => {
          setToast(null);
          toastTimerRef.current = null;
        }, durationMs);
      }




 return (
        <Box
          sx={{
            flexGrow: 1,
            mt: "70px", // push below navbar
            backgroundColor: "rgb(10, 22, 40)",
            display: "grid",
            gridTemplateRows: "1fr auto",
            pt: "20px",
            pb: "20px",
            pr:{md:"20px" , lg:"350px"},
            pl:{md:"20px" , lg:"350px"},
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
              <Grid key={1} size={{ md: 4 , lg:4 }}>
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
                    onSubmit={handleExitSlipSubmit}
                    sx={{
                      padding: "24px",
                      backgroundColor: "#20314E",
                      borderRadius: "12px 12px 12px 12px",
                      marginTop: "20px ",
                      width: "100%",
                    }}
                  >
                    {toast ? (
                      <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {toast}
                      </div>
                    ) : null}

                    {error ? (
                      <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                      </div>
                    ) : null}                    
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <label htmlFor="" style={{ color: "#fff" }}>
                          Leave Hour *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value ={exitTime}
                          onChange={(e) => setExitTime(e.target.value)}
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
                          required
                          value ={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
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
                      required
                      value ={gate}
                      onChange={(e) => setGate(e.target.value)}
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
                          disabled={isLoading}
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
                          {isLoading ? "Submitting..." : "Submit Request"}
                        </Button>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                          onClick={handleCancel}
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
                    onSubmit={handleAbsenceAuthorizationSubmit}
                    sx={{
                      padding: "24px",
                      backgroundColor: "#20314E",
                      borderRadius: "12px 12px 12px 12px",
                      marginTop: "20px ",
                      width: "100%",
                    }}
                  >
                    {toast ? (
                      <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {toast}
                      </div>
                    ) : null}

                    {error ? (
                      <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                      </div>
                    ) : null}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <label htmlFor="" style={{ color: "#fff" }}>Start Date *</label>
                        <input
                          type="date"
                          required
                          value ={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
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
                          required
                          value ={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
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
                      required
                      value ={reason}
                      onChange={(e) => setReason(e.target.value)}
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
                          disabled={isLoading}
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
                          {isLoading ? "Submitting..." : "Submit Request"}
                        </Button>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Button
                          onClick={handleCancel}
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





