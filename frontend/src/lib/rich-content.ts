export function wrapRichContentTables(html: string): string {
  if (!html || !/<table\b/i.test(html)) return html;

  return html
    .replace(/<table\b/gi, '<div class="blog-table-scroll"><table')
    .replace(/<\/table>/gi, '</table></div>');
}
