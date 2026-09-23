import "./globals.css";
import { siteConfig } from "../config/site";

export const metadata = {
	title: `${siteConfig.appName} | ${siteConfig.tagline}`,
	description: siteConfig.tagline,
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
