import flowbite from "flowbite/plugin";

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx,vue}',
		'node_modules/flowbite/**/*.{js,jsx,ts,tsx}',
		'./index.html',
		'./src/**/*.{vue,js,ts,jsx,tsx}'
	],
	plugins: [
		flowbite	
	],
	theme: {},
	darkMode: 'selector'
}

