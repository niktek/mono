- [x] ~~Add support for Astro~~ - deferred
- [x] ~~Add support for Vite~~ - deferred
- [x] Add help screen for all cli options
- [x] ~~Add `ora` spinner for working portion~~ - needs to be converted to async bullshit, or look at `execa`
- [x] Make the next steps portion more clear
- [ ] add /apple-touch-icon-precomposed.png ?
- [x] remove twplugins from UI and split into bools
- [ ] update build process to scan template sites dir to gather files


| create-svelte 	| create-vite 			| create-astro 		| create-skeleton-app
| --- 				| --- 					| ---	 			|---
| Directory 		| Name					| Directory			|
| Svelte template 	| Framework				| Astro template	|
| Types (TS/JS/None)| Variant (TS/JS/SK) 	| Install deps ?	|
| ESLint			|						| Init git ?		|
| Prettier			|						| TS strictness		|
| Playwright		|						|					|

# Notes
## create-svelte
- no argv support
- has entry point to call into
- outputs links to add-ons like eslint-plugin-svelte3
- happily blows away existing folders
- `Stuck? Visit us at {discord}`

## create-vite
- no argv support
- no entry point to call into
- uses cross-spawn to launch pm install
- has embedded templates for svelte
- conventional-changelog-cli
- simple-git-hooks lint-staged

## create-astro
- supports argv, but no help screen to show what the options are.
- argv support only pre-selects, still forces display of prompts
- no entry point to call into
- execa instead of spawn
- uses changeset
- pnpm only
- use astro-add for adding tailwind (if it can keep quiet)

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