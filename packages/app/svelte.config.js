import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV === 'development';
const buildDir = process.env.NODE_ENV === 'production' ? '../../docs' : '';

const config = {
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md']
		})],
	kit: {
		adapter: adapter({
			pages: buildDir,
			assets: buildDir,
			fallback: '200.html'
		}),
		prerender:{
			entries: ["*","/pop/"]
		}
	},
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
