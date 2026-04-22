/** Convert PascalCase or camelCase component name to kebab-case slug. Handles consecutive-uppercase acronyms (HTMLParser → html-parser). */
export function slugify(componentName: string): string {
  return componentName
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}
