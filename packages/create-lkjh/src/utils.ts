
import { fileURLToPath } from 'url';

export function dist(path:string) {
	return fileURLToPath(new URL(path, import.meta.url).href);
}
