// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // optional, default is 5173
    proxy: {
      "/ad": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        // If your backend route is actually /usersByEnv (no /ad prefix),
        // uncomment the rewrite to strip /ad from the forwarded path:
        // rewrite: (path) => path.replace(/^\/ad/, ''),
        // Helpful: add logging to see proxy activity
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              "[proxyReq]",
              req.method,
              req.url,
              "->",
              options.target,
            );
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("[proxyRes]", req.method, req.url, proxyRes.statusCode);
          });
          proxy.on("error", (err, req, res) => {
            console.error("[proxyError]", req.method, req.url, err.message);
          });
        },
      },
    },
  },
});
