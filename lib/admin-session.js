import { createHmac, timingSafeEqual } from "crypto";
import { adminCredentials } from "../config/admin-auth";

export const adminCookieName = "admin_session";
const sessionLifetimeSeconds = 60 * 60 * 8;
const sessionSecret =
	process.env.ADMIN_SESSION_SECRET || "development-only-change-me";

function signature(expiresAt) {
	return createHmac("sha256", sessionSecret)
		.update(`${adminCredentials.username}:${expiresAt}`)
		.digest("hex");
}

export function createAdminSession() {
	const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
	return `${expiresAt}.${signature(expiresAt)}`;
}

export function isAdminRequest(request) {
	if (
		process.env.NODE_ENV === "production" &&
		!process.env.ADMIN_SESSION_SECRET
	) {
		return false;
	}
	const token = request.cookies.get(adminCookieName)?.value;
	if (!token) return false;
	const [expiresAt, providedSignature] = token.split(".");
	if (
		!expiresAt ||
		!providedSignature ||
		Number(expiresAt) < Math.floor(Date.now() / 1000)
	)
		return false;
	const expectedSignature = signature(expiresAt);
	const providedBuffer = Buffer.from(providedSignature);
	const expectedBuffer = Buffer.from(expectedSignature);
	return (
		providedBuffer.length === expectedBuffer.length &&
		timingSafeEqual(providedBuffer, expectedBuffer)
	);
}

export function sessionCookie(token, maxAge = sessionLifetimeSeconds) {
	const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
	return `${adminCookieName}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAge};${secure}`;
}
