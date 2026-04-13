import { defineConfig, build } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'builds/module.js'),
      formats: ['esm'],
      fileName: () => `alpine-turnout.esm.js`,
    },
    rollupOptions: {
      external: ['alpinejs'],
    }
  },
  plugins: [{
    name: 'build-cdn',
    closeBundle: async () => {
      // Once the first build finishes, we manually trigger the second one
      await build({
        configFile: false, // Don't loop back into this config!
        build: {
          emptyOutDir: false, // KEEP the ESM file we just made
          lib: {
            entry: resolve(__dirname, 'builds/cdn.js'),
            name: 'AlpineTurnout',
            formats: ['umd'],
            fileName: () => `alpine-turnout.min.js`,
          },
          rollupOptions: {
            external: ['alpinejs'],
            output: {
              globals: { alpinejs: 'Alpine' }
            }
          }
        }
      })
    }
  }]
})
