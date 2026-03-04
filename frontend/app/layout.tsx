import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K8s Pulse – Kubernetes Cluster Dashboard",
  description: "Real-time Kubernetes workload monitoring: pods, deployments, HPA status, resource usage, and deploy history.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
