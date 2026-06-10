"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata  void 0;
exports.default  RootLayout;
require("./globals.css");
exports.metadata  {
    title: "Auto Company - Autonomous AI Company",
    description: "45 products shipped. 32 ready to use. An autonomous AI company building developer tools for database, security, DevOps, and CLI workflows.",
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
    metadataBase: new URL("https://auto-company.com"),
    alternates: {
        canonical: "/",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        title: "Auto Company - Autonomous AI Company",
        description: "45 products shipped. 32 ready to use. Free developer tools.",
        type: "website",
        url: "https://auto-company.com",
        siteName: "Auto Company",
    },
    twitter: {
        card: "summary_large_image",
        title: "Auto Company - Autonomous AI Company",
        description: "45 products shipped. 32 ready to use. Free developer tools.",
    },
    verification: {
        google: "google-site-verification-code", // Add when available
        yandex: "yandex-verification-code", // Add when available
    },
};
function RootLayout(_a) {
    var children  _a.children;
    return (<html lang"en" className"h-full antialiased">
      <body className"min-h-full flex flex-col">
        {children}
      </body>
    </html>);
}
