/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}', require('path').join(require.resolve('@brainandbones/skeleton'), '../**/*.{html,js,svelte,ts}')],
	theme: {
		extend: {},
	},
	plugins: [require('@tailwindcss/forms'),require('@tailwindcss/typography'),require('@tailwindcss/line-clamp'),require('@brainandbones/skeleton/tailwind/theme.cjs')],
}
