import { defineConfig } from 'rollup';
import replace from '@rollup/plugin-replace';


export default defineConfig([
	{
		input: './src/x-action.js',
		output: [
			{ format: 'esm', file: './dist/x-action.mjs' },
			{ format: 'cjs', file: './dist/x-action.js' },
		],
		plugins: [
			replace({
				preventAssignment: true,
				values: { DEV: 'false' },
			}),
		]
	},
	{
		input: './src/x-action.js',
		output: [
			{ format: 'esm', file: './dist/x-action.dev.mjs' },
			{ format: 'cjs', file: './dist/x-action.dev.js' },
		],
		plugins: [
			replace({
				preventAssignment: true,
				values: { DEV: 'true' },
			}),
		]
	},
]);
