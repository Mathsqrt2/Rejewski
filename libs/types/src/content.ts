export type ContentStorage = { [key: string]: (p?: string) => string };
export type NotFoundSubject = `Role` | `Guild` | `Member`;
export type ActionSuspendedSubject = `role`