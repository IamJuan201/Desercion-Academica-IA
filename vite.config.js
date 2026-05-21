import { defineConfig } from 'vite'

// Vite es como un servidor local del proyecto, el "proxy" le dice a Vite: cuando el 
// código llame a /ollama, redirigelo a Ollama que corre en localhost:11434.
// Esto evita errores de seguridad del navegador (CORS).

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, '')
      }
    }
  }
})
