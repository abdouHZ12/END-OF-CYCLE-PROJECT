import type { NextConfig } from "next";
import os from "os";

// Auto-detect all local network IPs
const localIPs = Object.values(os.networkInterfaces())
  .flat()
  .filter((iface) => iface?.family === "IPv4" && !iface.internal)
  .map((iface) => iface!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: [...localIPs, "localhost"],
};

export default nextConfig;