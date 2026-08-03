/**
 * Generate a short unique ID string for list/todo items.
 * Uses timestamp + random characters for uniqueness.
 */
export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
