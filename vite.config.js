import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'alpine-turnout.js',
      name: 'AlpineTurnout', // Required for UMD
      fileName: (format) => `alpine-turnout.${format}.js`,
      formats: ['esm', 'umd'] // Generates both!
    },
    rollupOptions: {
      // Make sure to externalize alpine if you don't want to bundle it
      external: ['alpinejs'],
      output: {
        globals: {
          alpinejs: 'Alpine'
        }
      }
    }
  }
})
