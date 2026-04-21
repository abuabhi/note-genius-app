
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

  let gitCommit;
  try {
    gitCommit = require('child_process')
      .execSync('git rev-parse HEAD', { encoding: 'utf8' })
      .trim();
  } catch (e) {
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
          // Core React — always needed
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Merged core: query + auth + utils. Each was <50KB and cost an HTTP round-trip.
          'vendor-core': [
            '@tanstack/react-query',
            '@tanstack/react-query-devtools',
            '@supabase/supabase-js',
            'date-fns',
            'uuid',
            'papaparse',
            'zod',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
          ],

          // Radix UI primitives
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
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-separator',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-alert-dialog',
          ],

          // PDF generation (only loaded on export)
          'vendor-pdf': ['pdfjs-dist', 'jspdf', 'html2canvas', 'docx'],

          // OCR engine (only loaded when user runs OCR)
          'vendor-ocr': ['tesseract.js'],

          // NOTE: recharts, @fullcalendar/*, @tiptap/*, moment intentionally NOT chunked here.
          // Letting Rollup auto-split puts them inside the lazy-loaded route chunks
          // that import them, so they're not downloaded on landing/dashboard.
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
