import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import createPlugins from './vite/plugins';
import path from 'path';
// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const isBuild = command === 'build';

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    plugins: createPlugins(env, command === 'build'),
    // 正确配置环境变量
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT),
      open: true,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: true
          // rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        },
        // 添加阿里云地理数据API的代理
        '/geo': {
          target: 'https://geo.datav.aliyun.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/geo/, '')
        }
      },
      optimizeDeps: {
        include: [
          'vue',
          'vue-router',
          'pinia',
          'axios',
          '@vueuse/core',
          'echarts',
          'vue-i18n',
          'image-conversion',
          'element-plus/es/components/**/css'
        ]
      },
      esbuild: isBuild
          ? {
            drop: ['console', 'debugger']
          }
          : {},
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            }
          }
        }
      }
    },
  }
})
