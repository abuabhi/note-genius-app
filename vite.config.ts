
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';
import fs from 'fs';

// Read package.json to get version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

// Generate build information
const generateBuildInfo = () => {
  const now = new Date();
  const buildTime = now.toISOString();
  const buildHash = now.toISOString().replace(/[^0-9]/g, '').substring(0, 12);
  
  // Try to get git commit hash (optional)
  let gitCommit;
  try {
    gitCommit = require('child_process')
      .execSync('git rev-parse HEAD', { encoding: 'utf8' })
      .trim();
  } catch (e) {
    // Git not available or not a git repo
    gitCommit = undefined;
  }
  
  return { buildTime, buildHash, gitCommit };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const buildInfo = generateBuildInfo();
  
  return {
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(buildInfo.buildTime),
    __BUILD_HASH__: JSON.stringify(buildInfo.buildHash),
    __GIT_COMMIT__: JSON.stringify(buildInfo.gitCommit),
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // UI library chunks
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip'
          ],
          
          // Query and state management
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          
          // Text editor and rich content
          'vendor-editor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-bullet-list',
            '@tiptap/extension-ordered-list',
            '@tiptap/extension-highlight',
            '@tiptap/extension-underline'
          ],
          
          // PDF and document processing
          'vendor-docs': ['pdfjs-dist', 'tesseract.js', 'html2canvas', 'jspdf'],
          
          // Charts and visualization
          'vendor-charts': ['recharts', '@fullcalendar/core', '@fullcalendar/react'],
          
          // Authentication and database
          'vendor-auth': ['@supabase/supabase-js'],
          
          // Utilities
          'vendor-utils': [
            'date-fns',
            'moment',
            'uuid',
            'papaparse',
            'zod',
            'clsx',
            'class-variance-authority',
            'tailwind-merge'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ]
  }
};
});
