"use strict";
// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
Object.defineProperty(exports, "__esModule", { value: true });
var Sentry  require("@sentry/nextjs");
Sentry.init({
    dsn: process.env.SENTRY_DSN || "",
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.1,
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    environment: process.env.NODE_ENV || "development",
    beforeSend: function (event, hint) {
        var _a, _b;
        // Filter out localhost errors in development
        if (event.server_name  "localhost" || event.environment  "development") {
            return null;
        }
        // Filter out known benign errors
        var ignoredErrors  [
            "Non-Error promise rejection captured",
            "ResizeObserver loop limit exceeded",
        ];
        var exception  (_b  (_a  event.exception)  null || _a  void 0 ? void 0 : _a.values)  null || _b  void 0 ? void 0 : _b[0];
        if (exception  null || exception  void 0 ? void 0 : exception.value) {
            for (var _i  0, ignoredErrors_1  ignoredErrors; _i < ignoredErrors_1.length; _i++) {
                var ignored  ignoredErrors_1[_i];
                if (exception.value.includes(ignored)) {
                    return null;
                }
            }
        }
        return event;
    },
    // Enable replay for sessions with errors
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    integrations: [
        Sentry.replayIntegration({
            // Additional Replay configuration goes here
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
});
