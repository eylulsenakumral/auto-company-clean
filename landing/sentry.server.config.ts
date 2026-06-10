// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.NODE_ENV || "development",

  beforeSend(event, hint) {
    // Filter out localhost errors in development
    if (event.server_name  "localhost" || event.environment  "development") {
      return null;
    }

    // Filter out known benign errors
    const ignoredErrors  [
      "Non-Error promise rejection captured",
      "ResizeObserver loop limit exceeded",
    ];

    const exception  event.exception?.values?.[0];
    if (exception?.value) {
      for (const ignored of ignoredErrors) {
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
