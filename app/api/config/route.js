import { promises as fs } from "fs";
import path from "path";
import { siteConfig } from "../../../config/site";
import { isAdminRequest } from "../../../lib/admin-session";

export const runtime = "nodejs";
const configFile = path.join(process.cwd(), "config", "site.js");

function publicConfig(config) {
	const { apiKeys, ...safeConfig } = config;
	return safeConfig;
}

export async function GET(request) {
	if (!isAdminRequest(request))
		return Response.json(
			{ error: "Admin authentication required" },
			{ status: 401 },
		);
	return Response.json({ config: publicConfig(siteConfig) });
}

export async function PUT(request) {
	if (!isAdminRequest(request))
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	const body = await request.json().catch(() => ({}));
	const nextConfig = body.config;
	if (
		!nextConfig ||
		typeof nextConfig !== "object" ||
		!nextConfig.appName ||
		!nextConfig.tagline ||
		!nextConfig.customer ||
		!nextConfig.admin
	) {
		return Response.json(
			{ error: "A complete site configuration is required" },
			{ status: 400 },
		);
	}
	const safeConfig = {
		...publicConfig(siteConfig),
		...nextConfig,
		appName: String(nextConfig.appName).slice(0, 100),
		tagline: String(nextConfig.tagline).slice(0, 180),
		currency: String(nextConfig.currency).slice(0, 8),
		currencySymbol: String(nextConfig.currencySymbol).slice(0, 4),
		serviceFee: Math.max(0, Number(nextConfig.serviceFee) || 0),
		taxRate: Math.max(0, Math.min(1, Number(nextConfig.taxRate) || 0)),
		defaultWaitMinutes: Math.max(
			0,
			Math.min(180, Number(nextConfig.defaultWaitMinutes) || 0),
		),
		maxOrderItems: Math.max(
			1,
			Math.min(100, Number(nextConfig.maxOrderItems) || 30),
		),
	};
	const file = `export const siteConfig = ${JSON.stringify({ ...safeConfig, apiKeys: siteConfig.apiKeys }, null, 2)};\n`;
	await fs.writeFile(configFile, file, "utf8");
	return Response.json({ config: publicConfig(safeConfig) });
}
