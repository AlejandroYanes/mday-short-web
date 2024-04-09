/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { withAxiom } from 'next-axiom';
await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = process.env.NODE_ENV === 'production' ? withAxiom({}) : {};

export default config;
