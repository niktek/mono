import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
	entries: ['./src/bin', './src/creator', './src/index'],
	clean: true,
	declaration: true,
	rollup: {
		emitCJS: true,
		inlineDependencies: true
	}
});
