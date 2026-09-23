import { reviews } from "../../../data/reviews";

export function GET() {
	return Response.json({ reviews });
}
