import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit()
	],
	optimizeDeps: {
		esbuildOptions: {
			target: 'esnext'
		}
	},
	build: {
		target: ["esnext"], // for bigints
		commonjsOptions: {
			transformMixedEsModules: true,
			// linked modules in a monorepo must be explicitly included
			include: [/@unspent\/drip/, /node_modules/]
		},
		
		sourcemap: true,
		rollupOptions: {
			output: {
				name: 'app',
				globals: {
					events: 'undefined'
				},

			},
			context: 'window'
		}
	}
	
});
