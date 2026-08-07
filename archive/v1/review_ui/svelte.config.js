import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: '../media_vault/review_ui_dist',
      assets: '../media_vault/review_ui_dist',
      fallback: '200.html',
      precompress: false,
      strict: true
    })
  }
};

export default config;

