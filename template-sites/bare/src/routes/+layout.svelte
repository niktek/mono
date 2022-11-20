<!-- YOU CAN DELETE EVERYTHING IN THIS LAYOUT -->
<script>
	import '@brainandbones/skeleton/themes/theme-skeleton.css';
	import '@brainandbones/skeleton/styles/all.css';
	import '../app.postcss';
	import { AppShell, AppBar } from '@brainandbones/skeleton';
</script>

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Skeleton</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a class="btn btn-sm btn-ghost-surface" href="https://discord.gg/EXqV7W8MtY" target="_blank" rel="noreferrer">Discord</a>
				<a class="btn btn-sm btn-ghost-surface" href="https://twitter.com/SkeletonUI" target="_blank" rel="noreferrer">Twitter</a>
				<a class="btn btn-sm btn-ghost-surface" href="https://github.com/Brain-Bones/skeleton" target="_blank" rel="noreferrer">GitHub</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
