/**
 * Matches Vento template paths that should become clickable links.
 *
 * The regex does not validate delimiters: it matches an `include`,
 * `layout` or ES-style `from` keyword followed by a quoted path ending
 * in `.vto` or `.vento` anywhere in the document, including inside
 * `{{ }}` tags and embedded JavaScript.
 *
 * Capturing groups:
 *  - group 1: the quote character (single or double)
 *  - group 2: the path
 */
const LINK_RE = /\b(?:include|layout|from)\s*(["'])([^"'\n]+\.(?:vto|vento))\1/g;

/**
 * Finds Vento template paths in plain text.
 *
 * @param {string} text The raw document text to scan.
 * @returns {{ path: string, start: number, end: number }[]}
 *   One entry per match, where `start`/`end` are offsets pointing at
 *   exactly the path (quotes excluded), suitable for
 *   `TextDocument.positionAt()`.
 */
export function findTemplateLinks(text) {
  const results = [];

  LINK_RE.lastIndex = 0;
  let match = LINK_RE.exec(text);
  while (match) {
    const start =
      match.index + match[0].length - match[1].length - match[2].length;
    results.push({ path: match[2], start, end: start + match[2].length });
    match = LINK_RE.exec(text);
  }

  return results;
}
