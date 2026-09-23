import { promises as fs } from "fs";
import path from "path";
import { products } from "../../../data/products";
import { isAdminRequest } from "../../../lib/admin-session";

export const runtime = "nodejs";
const productsFile = path.join(process.cwd(), "data", "products.js");

export async function GET() {
	return Response.json({ products });
}

export async function PUT(request) {
	const body = await request.json().catch(() => ({}));
	if (!isAdminRequest(request) || !Array.isArray(body.products)) {
		return Response.json(
			{ error: "Unauthorized or invalid product list" },
			{ status: 401 },
		);
	}
	if (
		body.products.length > 40 ||
		body.products.some(
			(item) => !item.id || !item.name || typeof item.price !== "number",
		)
	) {
		return Response.json(
			{ error: "Each product needs an id, name, and numeric price" },
			{ status: 400 },
		);
	}
	const safeProducts = body.products.map((item) => ({
		...item,
		name: String(item.name).slice(0, 80),
		description: String(item.description || "").slice(0, 180),
	}));
	const file = `export const products = ${JSON.stringify(safeProducts, null, 2)};\n`;
	await fs.writeFile(productsFile, file, "utf8");
	return Response.json({ products: safeProducts });
}
