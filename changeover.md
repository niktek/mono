# Change of Org checklist

## Accounts
- [ ] Github
- [ ] NPM
- [ ] [VS Marketplace](https://marketplace.visualstudio.com/manage)
  - Needs a generic Microsoft account.
  - Note that DNS entries have to be made to get a verified checkmark
- [ ] Google Analytics ? (best to leave until better analytics is decided upon)
- [ ] Twitter is skeletonUI - if it's to be changed, now is better than later

## Changeover checklist
- [ ] Github org migration of Skeleton Repo
- [ ] ~~Create replacement repo in BnB org with just a readme pointing to new org~~ **DO NOT DO THIS** [See red warning box](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)
- [ ] Adjust links in .github/ template files
- [ ] Copyright notice adjustment ?
- [ ] Create branch with updated doc site for any Github and brainandbonesllc.com links. **NOT** a mass find/replace as they are sponsors and Trey's links are still valid.
  - [ ] Home page links
  - [ ] Contributors guide
  - [ ] FAQ
- [ ] Deprecate old npm package with custom message
- [ ] Migrate create-skeleton-app into new monorepo
- [ ] Notify Discord - people who have forks/bookmarks
- [ ] Notify Twitter
- [ ] Add to changelog for next release
- [ ] Sort out shared access agreement and guide

## Changeover to monorepo
- [ ] `monomigrate` script to lower Skeleton into packages dir.  No split of docsite and lib.
- [ ] `monomigrate` script to bring over skeletonlabs.co into sites dir.
- [ ] formalise issue format to work with auto changelog generator
- [ ] format staged on commit
- [ ] root level eslint/formatter setups
- [ ] template sites setup for create-skeleton-app
- [ ] adjust create-skeleton-app build process to copy from template sites
