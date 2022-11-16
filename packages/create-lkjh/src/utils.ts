
import { fileURLToPath } from 'url';

export function dist(path:string) {
    return fileURLToPath(new URL(path, import.meta.url).href);
}

export function getHelpText() {
    return `
Option              Short   Quiet Default       Values                      Description
--help              -h                                                      This help screen
--name              -n      new-skeleton-app    string, no spaces           Name of the directory for the project
--types                     typescript          typescript|checkjs          Typescipt of Javascript with JSDoc
--prettier                  true                true|false                  Whether Prettier is added
--eslint                    true                true|false                  Whether ESLint is added
--playwright                false               true|false                  Whether Playwright is added
--framework         -f      svelte-kit          svelte-kit|svelte-kit-lib   Setup as Svelte Kit library project or library
--path              -p      ''                  relative or absolute path   Location to install, name is appended
--twplugins                 ''                  forms                       Comma delimited list of plugins, no spaces allowed
                                                typography                  
                                                line-clamp                  
                                                aspect-ratio                
--skeletontheme     -t      skeleton            skeleton                    Only one of these items for the Skeleton theme
                                                modern						
                                                hamlindigo					
                                                rocket						
                                                sahara						
                                                gold-nouveau				
                                                vintage						
                                                seafoam						
                                                crimson						
--skeletontemplate          bare                bare                        The Skeleton template to use
                                                shell
                                                all-components
`;
}

