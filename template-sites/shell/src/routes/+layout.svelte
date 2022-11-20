<script lang="ts">
	import '@brainandbones/skeleton/themes/theme-skeleton.css';
	import '@brainandbones/skeleton/styles/all.css';
	import '../app.postcss';
	import { AppShell, AppBar, Drawer } from '@brainandbones/skeleton';
	import { writable, type Writable } from 'svelte/store';
	
	// Persists the mobile-only nav drawer 'open' state
	const storeMobileDrawer: Writable<boolean> = writable(false);

	// Drawer Handler
	function drawerOpen(): void {
		storeMobileDrawer.set(true);
	}
</script>

<!-- Drawer for opening navigation on mobile -->
<Drawer open={storeMobileDrawer} display="lg:hidden" width="w-64">
	<nav class="list-nav p-5">
		<ul>
			<li><a href="/">Home</a></li>
			<li><a href="/why">Why Skeleton?</a></li>
		</ul>
	</nav>
</Drawer>

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4 hidden lg:block">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<button on:click={drawerOpen} class="lg:!hidden btn btn-sm">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="fill-token w-5 h-5">
						<path
							d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"
						/>
					</svg>
				</button>

				<strong class="text-xl uppercase">Skeleton</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm btn-ghost-surface"
					href="https://discord.gg/EXqV7W8MtY"
					target="_blank"
					rel="noreferrer">Discord</a
				>
				<a
					class="btn btn-sm btn-ghost-surface"
					href="https://twitter.com/SkeletonUI"
					target="_blank"
					rel="noreferrer">Twitter</a
				>
				<a
					class="btn btn-sm btn-ghost-surface"
					href="https://github.com/Brain-Bones/skeleton"
					target="_blank"
					rel="noreferrer">GitHub</a
				>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<!-- Sidebar Content -->
	<svelte:fragment slot="sidebarLeft">
		<div class="hidden lg:block  ">
			<nav class="list-nav">
				<ul>
					<li><a href="/">Home</a></li>
					<li><a href="/why">Why Skeleton?</a></li>
				</ul>
			</nav>
		</div>
	</svelte:fragment>

	<!-- Page Route Content -->
	<div class="container h-full mx-auto flex justify-center  p-10">
		<slot />
	</div>
</AppShell>
