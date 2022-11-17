
import { fileURLToPath } from 'url';

export function dist(path:string) {
    return fileURLToPath(new URL(path, import.meta.url).href);
}

export function getHelpText() {
    // Must use spaces for adjustments as output can get very wonky with tab output
    // Why not array of arrays, TBH it's more readable in source like this and easy to edit with column selection etc.
    return `
Option              Short   Quiet Default   Values                      Description
--help              -h                                                  This help screen
--name              -n      new-skel-app    string, no spaces           Name of the directory for the project
--types                     typescript      typescript|checkjs          Typescipt of Javascript with JSDoc
--prettier                  true            true|false                  Whether Prettier is added
--eslint                    true            true|false                  Whether ESLint is added
--playwright                false           true|false                  Whether Playwright is added
--framework         -f      svelte-kit      svelte-kit|svelte-kit-lib   Setup as Svelte Kit library project or library
--path              -p      ''              relative or absolute path   Location to install, name is appended
--forms                     false           true|false                  Add Tailwinds Forms plugin
--typography                false           true|false                  Add Tailwinds Typography plugin
--lineclamp                 false           true|false                  Add Tailwinds Lineclamp plugin
--skeletontheme     -t      skeleton        skeleton                    Choose one for the Skeleton theme
                                            modern
                                            hamlindigo
                                            rocket
                                            sahara
                                            gold-nouveau
                                            vintage
                                            seafoam
                                            crimson
--skeletontemplate          bare            bare                        The Skeleton template to use
                                            shell
                                            all-components
`;
}

