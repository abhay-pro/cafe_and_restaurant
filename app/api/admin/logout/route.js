import { sessionCookie } from "../../../../lib/admin-session";

export async function POST() {
	const response = Response.json({ authenticated: false });
	response.headers.set("Set-Cookie", sessionCookie("", 0));
	return response;
}
