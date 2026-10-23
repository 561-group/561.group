import { createLivingWebServer } from "@red-cup-engineering/living-web-server/fetch";
import { project561GroupHome } from "./home-tufte.mjs";

/**
 * The existing 561.group Worker is the host; this is one Group-owned consumer
 * of the house LivingWebServer and TUFTE engines, not another listener/router.
 * Source readers are supplied by the same versioned site release. A source
 * commit without an accepted provider deployment cannot change public pages.
 */
export function create561GroupLivingApplication({ readHome, readEstate } = {}) {
  if (typeof readHome !== "function" || typeof readEstate !== "function") {
    throw new TypeError("Original Group home and public estate readers are required");
  }
  return createLivingWebServer({
    origin: "https://561.group",
    authorizePublicRead: ({ resource, context }) =>
      resource === "home" && ["GET", "HEAD"].includes(context.request.method),
    home: async context => project561GroupHome({
      home: await readHome(context), estate: await readEstate(context),
    }),
  });
}
