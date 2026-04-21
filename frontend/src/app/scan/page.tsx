'use client';

import { useEffect , useCallback , useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {scanPost , type ApiError} from "@/lib/api";


type ScanResponse = {
  message?: string;
  document : {
    id: string;
    type: string;
    state: string;
  }
}


export default function ScanPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [message , setMessage] = useState<string | null>(null);

  const scan = useCallback(async () => {
        try{

            const token = params.get("token");
            if (!token) throw new Error("Missing token in URL");

            const jwt = localStorage.getItem("naftal.accessToken");

            // Not logged in → redirect to login
            if (!jwt) {
            router.push(`/auth?redirect=/scan?token=${token}`);
            return;
            }

            const res = await scanPost<ScanResponse>(`/api/scan`, { token }, jwt);
            setMessage(res.message? res.message : "Scan completed successfully.");
        }
        catch(err) {
            const apiError = err as ApiError;
            setError(apiError.message || "An error occurred during scanning.");
        }
   },[params, router]) 

  useEffect(() => {

    scan();

  }, [scan]);

  return <div> ${message}
               ${error}
  </div>;
}