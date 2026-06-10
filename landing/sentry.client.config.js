"use strict";
// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users' browser is loaded.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
Object.defineProperty(exports, "__esModule", { value: true });
var Sentry  require("@sentry/nextjs");
var nextjs_1  require("@sentry/nextjs");
Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.1,
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    environment: process.env.NODE_ENV || "development",
    beforeSend: function (event, hint) {
        var _a, _b, _c, _d;
        // Filter out localhost errors in development
        if (event.environment  "development") {
            return null;
        }
        // Filter out extension-related errors
        if ((_b  (_a  event.request)  null || _a  void 0 ? void 0 : _a.url)  null || _b  void 0 ? void 0 : _b.includes("chrome-extension://")) {
            return null;
        }
        // Filter out known benign errors
        var ignoredErrors  [
            "Non-Error promise rejection captured",
            "ResizeObserver loop limit exceeded",
            "Script error.",
        ];
        var exception  (_d  (_c  event.exception)  null || _c  void 0 ? void 0 : _c.values)  null || _d  void 0 ? void 0 : _d[0];
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
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
        (0, nextjs_1.browserProfilingIntegration)(),
    ],
    // profilesSampleRate is relative to tracesSampleRate
    // 1.0 here captures 100% of transactions when trace is active
    profilesSampleRate: 0.1,
});
