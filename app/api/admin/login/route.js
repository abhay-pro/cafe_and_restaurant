import {
	adminAuthConfigured,
	adminCredentials,
} from "../../../../config/admin-auth";
import {
	createAdminSession,
	sessionCookie,
} from "../../../../lib/admin-session";

export async function POST(request) {
	if (!adminAuthConfigured) {
		return Response.json(
			{ error: "Production admin credentials are not configured" },
			{ status: 500 },
		);
	}
	const body = await request.json().catch(() => ({}));
	const valid =
		body.username === adminCredentials.username &&
		body.password === adminCredentials.password;
	if (!valid) return Response.json({ authenticated: false }, { status: 401 });
	const response = Response.json({ authenticated: true });
	response.headers.set("Set-Cookie", sessionCookie(createAdminSession()));
	return response;
}
