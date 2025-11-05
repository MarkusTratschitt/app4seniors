import type { NitroApp } from "nitropack";
import { defineNitroPlugin } from "nitropack";

type HtmlPayload = {
  head: string[];
  body: {
    prepend: string[];
    append: string[];
  };
};

export default defineNitroPlugin((nitroApp: NitroApp) => {
  nitroApp.hooks.hook("render:html", (html: HtmlPayload) => {
    html.head.push('<meta name="description" content="Senioren Tech Hilfe" />');
  });
});
