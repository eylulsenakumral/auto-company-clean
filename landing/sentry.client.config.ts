// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users' browser is loaded.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { browserProfilingIntegration } from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.NODE_ENV || "development",

  beforeSend(event, hint) {
    // Filter out localhost errors in development
    if (event.environment  "development") {
      return null;
    }

    // Filter out extension-related errors
    if (event.request?.url?.includes("chrome-extension://")) {
      return null;
    }

    // Filter out known benign errors
    const ignoredErrors  [
      "Non-Error promise rejection captured",
      "ResizeObserver loop limit exceeded",
      "Script error.",
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

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    browserProfilingIntegration(),
  ],

  // profilesSampleRate is relative to tracesSampleRate
  // 1.0 here captures 100% of transactions when trace is active
  profilesSampleRate: 0.1,
});
