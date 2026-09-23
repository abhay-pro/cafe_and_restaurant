import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { siteConfig } from "../../../config/site";
import { isAdminRequest } from "../../../lib/admin-session";

export const runtime = "nodejs";
const ordersFile = path.join(process.cwd(), "data", "orders.json");

async function readOrders() {
	return JSON.parse(await fs.readFile(ordersFile, "utf8"));
}

async function writeOrders(orders) {
	await fs.writeFile(ordersFile, JSON.stringify(orders, null, 2), "utf8");
}

export async function GET(request) {
	if (!isAdminRequest(request)) {
		return Response.json(
			{ error: "Admin authentication required" },
			{ status: 401 },
		);
	}
	return Response.json({ orders: await readOrders() });
}

export async function POST(request) {
	const body = await request.json().catch(() => ({}));
	const customer = body.customer || {};
	const items = Array.isArray(body.items)
		? body.items.slice(0, siteConfig.maxOrderItems)
		: [];
	if (
		!customer.name ||
		!/^\S+@\S+\.\S+$/.test(customer.email) ||
		!customer.phone ||
		!items.length ||
		!body.total
	) {
		return Response.json(
			{ error: "Please provide valid customer and order details" },
			{ status: 400 },
		);
	}
	const order = {
		id: `LL-${randomUUID().slice(0, 6).toUpperCase()}`,
		customer: {
			name: String(customer.name).slice(0, 80),
			email: String(customer.email).slice(0, 120),
			phone: String(customer.phone).slice(0, 30),
		},
		items,
		total: Number(body.total),
		payment: "Payment authorized (demo)",
		status: "new",
		waitMinutes: siteConfig.defaultWaitMinutes,
		createdAt: new Date().toISOString(),
	};
	const orders = await readOrders();
	await writeOrders([order, ...orders].slice(0, 500));
	return Response.json({ order }, { status: 201 });
}

export async function PATCH(request) {
	if (!isAdminRequest(request)) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const body = await request.json().catch(() => ({}));
	if (
		!body.id ||
		!["new", "preparing", "ready", "delivered", "cancelled"].includes(
			body.status,
		)
	) {
		return Response.json({ error: "Invalid order update" }, { status: 400 });
	}
	const orders = await readOrders();
	const updated = orders.map((order) =>
		order.id === body.id
			? {
					...order,
					status: body.status,
					waitMinutes: Math.max(0, Number(body.waitMinutes) || 0),
				}
			: order,
	);
	await writeOrders(updated);
	return Response.json({ orders: updated });
}
