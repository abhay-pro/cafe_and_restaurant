export const adminCredentials = {
	username: process.env.ADMIN_USERNAME || "admin",
	password: process.env.ADMIN_PASSWORD || "admin",
};

export const adminAuthConfigured =
	process.env.NODE_ENV !== "production" ||
	Boolean(
		process.env.ADMIN_USERNAME &&
			process.env.ADMIN_PASSWORD &&
			process.env.ADMIN_SESSION_SECRET,
	);
