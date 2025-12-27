import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: false // Allow missing routes during build
    }),
    prerender: {
      handleHttpError: ({ path, referrer, message }) => {
        // Warn but don't fail for missing routes (linked from nav)
        if (message.includes('404')) {
          console.warn(`Warning: Missing page ${path} (linked from ${referrer})`);
          return;
        }
        throw new Error(message);
      }
    }
  }
};

export default config;

