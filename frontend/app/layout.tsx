import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K8s Pulse – Kubernetes Cluster Dashboard",
  description: "Real-time Kubernetes workload monitoring: pods, deployments, HPA status, resource usage, and deploy history.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "K8s Pulse – Kubernetes Cluster Dashboard",
    description: "Real-time Kubernetes workload monitoring dashboard. Pods, deployments, HPA autoscaling, node resource usage, rolling deploy history — live WebSocket updates every 3s.",
    url: "https://k8spulse.vercel.app",
    siteName: "K8s Pulse",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "K8s Pulse – Kubernetes Cluster Dashboard",
    description: "Real-time Kubernetes workload monitoring. Pods, HPA, deployments, events — live WebSocket updates.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
