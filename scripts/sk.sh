#!/usr/bin/env bash
rm -rf ./sites/newinstall
pnpm build
pnpm i -wD create-skeleton-app
pnpm cre -n newinstall -f svelte-kit -t crimson --types=typescript --prettier --eslint --playwright=false --twplugins=none -q -p sites/