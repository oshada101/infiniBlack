// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // custom domain via public/CNAME — placeholder until exact domain confirmed
  site: 'https://infiniblack.com',
  vite: {
    plugins: [tailwindcss()]
  }
});