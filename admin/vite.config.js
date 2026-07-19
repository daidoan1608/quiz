import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],
    base: env.VITE_ADMIN_BASENAME || '/',
    server: {
      port: 3001,
    },
    preview: {
      port: 3004,
    },
    build: {
      chunkSizeWarningLimit: 1300,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (id.includes("antd") || id.includes("@ant-design") || id.includes("@rc-component") || id.includes("rc-")) {
              return "vendor-antd";
            }
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            if (id.includes("recharts") || id.includes("d3-")) {
              return "vendor-charts";
            }
            if (id.includes("@dnd-kit")) {
              return "vendor-dnd";
            }
            if (id.includes("axios")) {
              return "vendor-http";
            }
            return undefined;
          },
        },
      },
    },
  };
});
