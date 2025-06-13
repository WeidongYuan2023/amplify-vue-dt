import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import svgLoader from 'vite-svg-loader';
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  
  // 根据部署目标确定基础路径
  const getBasePath = () => {
    // 如果是 API Gateway 部署（通过环境变量标识）
    if (env.VITE_DEPLOY_TARGET === 'apigateway') {
      return '/amplify-dt/';
    }
    // 如果明确设置了 VITE_BASE_URL（但不是 API Gateway 部署）
    if (env.VITE_BASE_URL && env.VITE_DEPLOY_TARGET !== 'amplify') {
      return env.VITE_BASE_URL;
    }
    // 默认使用根路径（适用于 Amplify 直接部署）
    return '/';
  };
  
  const basePath = getBasePath();
  
  console.log(`Vite Config - Mode: ${mode}, Deploy Target: ${env.VITE_DEPLOY_TARGET}, Base Path: ${basePath}`);
  
  return {
    plugins: [vue(), svgLoader({
      svgoConfig: {
        // 关闭可能删除 <defs> 的优化
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                removeUselessDefs: false,
                cleanupIds: false, // Note: 'cleanupIDs' is now 'cleanupIds' (lowercase 'ids')
              },
            },
          },
        ],
      },
    }), vueJsx()],
    server: {
      host: '0.0.0.0',
      allowedHosts: ['cognitodemo.msoft2010.com'],
      proxy: {
        [env.VITE_WS_BASE_API]: {
          target: env.VITE_WS_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_WS_BASE_API), '')
        },
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        }
      },
      port: 5173
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@assets': path.resolve(__dirname, 'public/assets'),
        '@models': path.resolve(__dirname, 'public/models')
      },
      extensions: ['.js', '.ts', '.json', '.vue'] // 配置扩展名
    },
    assetsInclude: [
      '**/*.jpg', '**/*.png', '**/*.svg', '**/*.glb', '**/*.gltf', 
      '**/*.fbx', '**/*.obj', '**/*.mtl', '**/*.drc'
    ],
    base: basePath,
    build: {
      outDir: "dist",
      copyPublicDir: true,
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            'three': ['three'],
            'gsap': ['gsap']
          },
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      }
    },
    optimizeDeps: {
      entries: [
        'src/main.js',
        'src/main.ts'
      ]
    }
  }
})