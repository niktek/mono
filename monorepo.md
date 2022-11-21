# Monorepo for Svelte Kit projects

General overview https://www.youtube.com/watch?v=QNaiKN4AaHw&t=370s worth watching through to the end as the Q&A section covers some relevant issues for us.

Goals:
Allow multiple packages to sit in the one repo and reference each other.

Secondary goals:
Allow for integration with private repo's for any commercial add-on's.

Setting up a monorepo with pnpm is a couple of lines in a single file `pnpm-workspace.yaml`.  As nicely summed up in Scott's video, lerna, turbo, rush etc add even more complexity on top of this, for no apparent gains for a repo of our size.

The monorepo affects things in the following ways:
	1. pnpm will prevent you from adding a package to the root project unless you explicitly use the -w (workspace) flag
	2. you can now reference other packages in the monorepo.  When you pnpm i -D @brainandbones/skeleton to another site, it will auto insert it with workspace:* reference.
	3. you can now do bulk commands from the root like building, installing, upgrading packages, etc.  These can be scoped with filters.
	4. Git branching and tagging strategy needs to take into account multiple projects
	5. Builds need to be more selective in what triggers them - e.g. GitHub Actions already have means to filter on what branch or folder a commit happens.
	6. You can create a config package that have settings for eslint/prettier/etc and add a workspace reference to other project so that all projects have consistent and ready to go settings.


Anything beyond this applied to any repo:
	- [changesets](https://github.com/changesets/changesets) - allows for writing more verbose commit messages in markdown instead of the limited git commit message block.  Also handles things like semver and producing aggregated changelog.  Feels a little clunky with the commit process to trigger the generation of them.
	- [bummpp](https://github.com/antfu/bumpp) handles publishing and versioning of a release, perfect for the CLI tools where release notes are not as needed.
	- [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks) For things like format/lint on staged commit files.
	- [husky](https://typicode.github.io/husky/#/?id=features) Same as git hooks
	- standardise commit messaging



It's common in coding projects to start splitting code into a re-usable component library or other commonly re-used code. With Vite based projects like Svelte and Svelte Kit, you'll be familiar with the default `$lib` alias, but it's easy to extend this to add your own in `vite.config.js`

```js
const config = {
	resolve: {
		alias: {
			$mylib: path.resolve('./src/mylib')
		}
	},
```

And you can use it like this:

```html
<script>
  import CommonComponent from "$mylib/CommonComponent.svelte";
  import ProjSpecificComp from "$lib/ProjSpecificComp.svelte";
</script>
```

This is all well and good for a single component library and project, but the next project has come along that also wants to use that component library. You can absolutely extend this alias config in the new project to point over to the original project with the component library and carry on with shared code goodness.

But if you start to see the need for multiple package.json's that might share some code with each other, or that it would be handy to know which of your sites might be affected by a change to a component in your ui library, or it would be nice to share a common setup for your linting/testing between your projects, then you are likely to be looking into a monorepo. Fortunately the [Monorepo tools](https://monorepo.tools) site can give you a great overview of what they are and which ones are available.

To be clear, you probably don't need most of those features being touted like the distributed caching, code generation etc and that's totally fine, you can incrementally adopt features into your monorepo as your needs grow and your team becomes more familiar with it.

## Features to work in a monorepo

- simultaneous dev of related projects with HMR (client site, component lib, backend)
- multiple projects with different publishing options e.g. (Front End vs Back End vs CLI tool)
- common prettier/eslint settings for all projects
- publishing select packages to public repo
- task running of tests
- common pre-commit formatting/linting/testing through husky
  - [Lint Staged](https://github.com/okonet/lint-staged)
  - [Husky](https://github.com/typicode/husky)

## Features common irrespective of monorepo manager

# Testing between pnpm, Lerna+Nx and Turbo

## PNPM

- supports monorepos natively through workspaces
- can run commands to a specific workspace with `-F "<package>*` or to all of them with `-r` for recursive operations, usually via package script commands in the top level project

## Lerna and NX

- been around longer and is more featured with things like Auto versioning and publishing of packages.

## Turbo

- less features than Lerna + NX
- but, it's Vercel. Tighter integration with Vercel's hosting? Will turbo pack be that great ? It will support Svelte/SK someday.

# Meta repos

This is where each package can be it's own git repo, this could be handy where you have 3rd party repos that are only a part of your project and you may wish to commit back to your fork of their repo. You would probably want to exclude this from the workspace definition of your direct packages for things like publishing/deploying.

# create-skeleton-app

There are 3 universal principles of a good CLI:

- accept flags from the process arg vector (argv)
- optionally prompt for required information that has not been provided
- provide a clean API for your functionality to be called directly
  Throughout these three phases there is a reliance on a data struct representing the information required to achieve it's goals. This is filled in from argv, then prompts or sane defaults or bypassed completely and called by another program who provides their own UI and passes the data directly.

create-svelte is used programmatically under the hood. It doesn't accept command line argv's and forces the prompt of all questions. Majority of questions are copied into CSA to make maintenance pretty easy. The best path forward is to provide a PR to svelte-create that addresses these issues.

svelte-add was evaluated for adding tailwind, typography, forms, but:

- new projects vs updating existing projects - we only handle new installations, whereas svelte-add handles adding to an existing installation. The order of magnitude differential between those two scenarios is massive. We can make assumptions about the install because we placed them there. Svelte-add has to assume that it could have been altered by the end dev and has fallen back to AST parsing things and even then it can't capture all of the creative ways that programmers could foil it.
- there is no way to call it programmatically without bringing across into CSA all of the environment detection stuff that it requires before running the actual adder
- it console.logs() freely, which would interrupt our presentation of prompts (yes, we could redirect stdio etc, but meh)
- we currently have more installs per month, i don't feel that this is accepted as a standard way of installing things
- it is technically correct, the right kind of correct... except for this situation. This is an install helper, not a runtime feature. The bar has been set so high for additions and maintenance of those additions for something that is used for a few seconds of an entire projects lifetime.
- it's maintained by a single person, who has no incentive to update things other than glorious internet points, we have a double upstream liability of breaking changes to maintain that i don't feel is warranted.

As a result, we have one less dependency, support for all 4 tailwind plugins straight away.
