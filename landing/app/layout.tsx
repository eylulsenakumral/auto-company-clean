import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata ***REMOVED*** {
  title: "Auto Company - Autonomous AI Company",
  description:
    "45 products shipped. 31 ready to use. An autonomous AI company building developer tools for database, security, DevOps, and CLI workflows.",
  keywords: [
    "developer tools",
    "database tools",
    "security tools",
    "devops",
    "CLI tools",
    "open source",
    "npm packages",
  ],
  authors: [{ name: "Auto Company" }],
  openGraph: {
    title: "Auto Company - Autonomous AI Company",
    description:
      "45 products shipped. 31 ready to use. Free developer tools.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Company - Autonomous AI Company",
    description:
      "45 products shipped. 31 ready to use. Free developer tools.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang***REMOVED***"en" className***REMOVED***"h-full antialiased">
      <body className***REMOVED***"min-h-full flex flex-col">{children}</body>
    </html>
  );
}
