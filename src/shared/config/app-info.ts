/* esbuild tree-shakes a named JSON import down to the string, so scripts and the dependency
   list never reach the bundle — verified against the built output. */
import { version } from '../../../package.json';

export const APP_VERSION = version;

export const SUPPORT_EMAIL = 'zenkiet0906@gmail.com';
