import assert from "node:assert/strict";
import fs from "node:fs";
import { analyticsScriptTag, siteEventsScriptTag, UMAMI_WEBSITE_IDS, UMAMI_CORPORATE_DOMAINS } from "../site-analytics.js";
import { describeSiteEvent, getSiteEventContext, initSiteEvents } from "../site-events.js";

const production = "https://lancloudtech.com/";
const preview = "https://global.lancloudtech.com/preview/en/";
assert.deepEqual(getSiteEventContext(preview), { site_version: "preview", language: "en", route: "/" });
assert.deepEqual(getSiteEventContext("https://lancloudtech.com/zh-Hant/ai-course/"), { site_version: "legacy", language: "zh-Hant", route: "/ai-course/" });
assert.equal(getSiteEventContext("https://lancloudtech.com/previewish/").site_version, "legacy");

for (const [href, name] of [
  ["mailto:lance@lancloudtech.com?subject=Private%20draft&body=Do%20not%20collect", "inquiry_email"],
  ["tel:+86-17380566771", "inquiry_phone"],
  ["./contact/wecom/", "inquiry_wecom"],
  ["https://leadshunter.lancloudtech.com/", "product_leadshunter"],
  ["./leadshunter/", "product_leadshunter"],
  ["./ai-course/", "academy_overview"],
  ["#academy", "academy_overview"],
  ["./ai-course/fde/", "academy_overview"],
  ["https://appstore.lancloudtech.com/", "app_download"],
  ["./solutions/", "solutions_overview"],
]) assert.equal(describeSiteEvent({ href }, production).name, name, href);

const alias = describeSiteEvent({ href: "/preview/en/ai-course/", eventName: "hero_academy" }, preview);
assert.deepEqual(alias, { name: "academy_overview", data: { site_version: "preview", language: "en", course_path: "overview" } });
assert.equal(describeSiteEvent({ href: "/preview/en/ai-course/mvp-3day/" }, preview).data.course_path, "mvp-3day");
assert.equal(describeSiteEvent({ href: "/preview/en/ai-course/fde/" }, preview).data.course_path, "fde");

const forward = describeSiteEvent({ href: "/preview/", versionSwitch: true }, production);
assert.deepEqual(forward, { name: "website_version_switch", data: { site_version: "legacy", language: "zh-Hans", from_version: "legacy", to_version: "preview" } });
const reverse = describeSiteEvent({ href: "https://lancloudtech.com/en/" }, preview);
assert.equal(reverse.name, "website_version_switch");
assert.equal(reverse.data.from_version, "preview");
assert.equal(reverse.data.to_version, "legacy");
assert.equal(describeSiteEvent({ href: "/preview/en/", eventName: "website_version_switch" }, preview), null);
assert.equal(describeSiteEvent({ href: "https://unrelated.example/", versionSwitch: true }, preview), null);
assert.equal(describeSiteEvent({ href: "/contact/wecom/" }, preview).name, "inquiry_wecom");
assert.equal(describeSiteEvent({ href: "#method" }, production), null);
assert.equal(describeSiteEvent({ href: "#paths" }, `${production}ai-course/`), null, "in-page course jumps must not inflate course entry counts");
assert.equal(describeSiteEvent({ href: "#vect" }, `${production}solutions/`), null);
assert.equal(describeSiteEvent({ href: "mailto:lance@lancloudtech.com?body=private", topic: "training" }, production).data.topic, "training");
assert.equal(describeSiteEvent({ href: "mailto:lance@lancloudtech.com", topic: "private free text" }, production).data.topic, undefined);
assert.equal(JSON.stringify(describeSiteEvent({ href: "mailto:lance@lancloudtech.com?body=private" }, production)).includes("private"), false);
for (const hostname of ["img.lancloudtech.com", "files.lancloudtech.com"]) {
  const event = describeSiteEvent({ href: `https://${hostname}/ai-course/lesson-1.zip`, download: "practice" }, preview);
  assert.equal(event.name, "course_download");
  assert.equal(event.data.resource, "practice");
}

class Element {
  constructor(attributes = {}, tagName = "A") { this.attributes = new Map(Object.entries(attributes)); this.tagName = tagName; this.children = []; }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  getAttributeNames() { return [...this.attributes.keys()]; }
  hasAttribute(name) { return this.attributes.has(name); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  querySelectorAll() { return this.children.filter(child => child.hasAttribute("data-umami-event")); }
  closest() { return this; }
}
const email = new Element({ href: "mailto:lance@lancloudtech.com?body=private", "data-umami-event": "contact_email", "data-umami-event-email": "do-not-send" });
const nested = new Element({ "data-umami-event": "contact_email" }, "SPAN");
email.children.push(nested);
const listeners = [];
const win = {
  location: { href: preview },
  addEventListener(type, callback, capture) { listeners.push({ type, callback, capture }); },
  document: { readyState: "complete", querySelectorAll() { return [email, nested]; } },
};
const first = initSiteEvents(win);
assert.equal(initSiteEvents(win), first);
assert.equal(listeners.length, 1, "one normalizer listener per window");
assert.equal(listeners[0].type, "click");
assert.equal(listeners[0].capture, true, "window capture precedes deployed Umami document capture");
assert.equal(email.getAttribute("data-umami-event"), "inquiry_email");
assert.equal(email.getAttribute("data-umami-event-email"), null, "only approved fields survive normalization");
assert.equal(nested.getAttribute("data-umami-event"), null, "nested labels cannot bypass anchor navigation handling");
assert.equal(email.getAttribute("href"), "mailto:lance@lancloudtech.com?body=private", "normalization preserves the working link");

// Simulate one click reaching our WINDOW capture listener before Umami's DOCUMENT
// capture listener. Only the latter is the sender; dynamic topic updates survive.
const received = [];
const click = () => {
  listeners[0].callback({ target: email, button: 0 });
  received.push({ name: email.getAttribute("data-umami-event"), topic: email.getAttribute("data-umami-event-topic") });
};
email.setAttribute("data-umami-event-topic", "training");
click();
assert.deepEqual(received, [{ name: "inquiry_email", topic: "training" }]);
email.setAttribute("data-umami-event-topic", "global");
click();
assert.equal(received.length, 2, "each click contributes one event");
assert.equal(received[1].topic, "global");

const pending = [];
const early = { ...win, document: { readyState: "loading", querySelectorAll() { return []; }, addEventListener(type, callback, options) { pending.push({ type, callback, options }); } }, addEventListener() {} };
initSiteEvents(early);
initSiteEvents(early);
assert.equal(pending.length, 1, "one DOM-ready pass even with repeated initialization");
assert.equal(pending[0].options.once, true);

const tag = analyticsScriptTag("lan");
assert.equal((tag.match(/<script\b/g) || []).length, 1);
assert.ok(tag.includes(`data-website-id="${UMAMI_WEBSITE_IDS.lan}"`));
assert.ok(tag.includes('src="https://stats.lancloudtech.com/u.js"'));
assert.ok(tag.includes(`data-domains="${UMAMI_CORPORATE_DOMAINS.join(",")}"`));
assert.ok(!tag.includes("data-auto-track") && !tag.includes("data-auto-pageview"), "Umami retains normal automatic pageviews");
for (const host of ["localhost", "127.0.0.1", "::1", "lan-homepage.pages.dev"]) assert.ok(!UMAMI_CORPORATE_DOMAINS.includes(host));
for (const key of ["contact", "guide", "leadshunter"]) {
  assert.ok(analyticsScriptTag(key).includes(`data-website-id="${UMAMI_WEBSITE_IDS[key]}"`));
  assert.ok(!analyticsScriptTag(key).includes("data-domains"), "do not change non-corporate tracker routing");
}
assert.equal(analyticsScriptTag("unknown"), "");
assert.ok(siteEventsScriptTag().includes('src="/site-events.js"'));
assert.ok(siteEventsScriptTag('../site-events.js').includes('src="../site-events.js"'));
const eventsSource = fs.readFileSync(new URL("../site-events.js", import.meta.url), "utf8");
assert.ok(!/\bumami\.track\s*\(|\bfetch\s*\(|\bsendBeacon\s*\(/.test(eventsSource), "shared events module must not become a second sender");
console.log("PASS: shared event taxonomy, version/language context, single initialization, live topic updates, anchor preservation, corporate-only tracker domains, and unchanged website IDs.");
