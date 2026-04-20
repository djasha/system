export const CATEGORIES = ['input', 'display', 'navigation', 'layout', 'motion', 'overlay', 'feedback'] as const;
export type Category = typeof CATEGORIES[number];

export const STATUSES = ['stable', 'beta', 'experimental'] as const;
export type Status = typeof STATUSES[number];

export const TOKEN_CATEGORIES = ['color', 'type', 'space', 'radius', 'shadow', 'motion'] as const;
export type TokenCategory = typeof TOKEN_CATEGORIES[number];
