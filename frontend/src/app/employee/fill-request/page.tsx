"use client"

import { div } from "framer-motion/client";
import * as React from "react";
import { useState , useEffect } from "react";


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
    

    const [selected , setSelected] = React.useState<string>("exitSlip");




 return (
    <div>

        <select value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="exitSlip">Exit Slip</option>
            <option value="absenceAuth">Absence Authorization</option>
            <option value="missionOrder">Mission Order</option>
        </select>

        {/* form for exit slip*/}
        {selected === "exitSlip" && (
        <div>
        <form action="POST">
            <label htmlFor="exitTime">exitTime:</label>
                <input type="text" id="exitTime" value={exitTime} onChange={(e)=>{setExitTime(e.target.value)}} />
            <label htmlFor="returnTime">returnTime:</label>
                <input type="text" name="returnTime" id="returnTime" value={returnTime} onChange={(e)=>{setReturnTime(e.target.value)}} /> 
            <label htmlFor="gate">gate:</label>
                <input type="text" name="gate" id="gate" value={gate} onChange={(e)=>{setGate(e.target.value)}} />
            <button type="submit">Submit</button>
        </form>
        </div> )}

        {/* form for Mision Order*/}
        {selected === "missionOrder" && (
        <div>
        <form action="POST">
            <label htmlFor="destination">Destination:</label>
                <input type="text" id="destination" value={destination} onChange={(e)=>{setDestination(e.target.value)}} />
            <label htmlFor="duration">Duration:</label>
                <input type="text" name="duration" id="duration" value={duration} onChange={(e)=>{setDuration(e.target.value)}} /> 
            <label htmlFor="purpose">purpose:</label>
                <input type="text" name="purpose" id="purpose" value={purpose} onChange={(e)=>{setPurpose(e.target.value)}} />
            <label htmlFor="travelMethod">Travel Method:</label>
                <input type="text" name="travelMethod" id="travelMethod" value={travelMethod} onChange={(e)=>{setTravelMethod(e.target.value)}} />
            <button type="submit">Submit</button>
        </form>
        </div> )}

        {/* form for Absence Auth */}
        {selected === "absenceAuth" && (
        <div>
        <form action="POST">
            <label htmlFor="startDate">startDate:</label>
                <input type="startDate" id="startDate" value={startDate} onChange={(e)=>{setStartDate(e.target.value)}} />
            <label htmlFor="endDate">endDate:</label>
                <input type="text" name="endDate" id="endDate" value={endDate} onChange={(e)=>{setEndDate(e.target.value)}} /> 
            <label htmlFor="reason">Reason:</label>
                <input type="text" name="reason" id="reason" value={reason} onChange={(e)=>{setReason(e.target.value)}} />
            <button type="submit">Submit</button>
        </form>
        </div> )}

    </div>
 );
}





