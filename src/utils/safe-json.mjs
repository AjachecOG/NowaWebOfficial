export function safeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
