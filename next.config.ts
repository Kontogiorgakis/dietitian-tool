import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Guidance lives in CLAUDE.md and .claude/rules/, so stop `next dev` from injecting its own block.
const nextConfig: NextConfig = { agentRules: false };

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");
export default withNextIntl(nextConfig);
