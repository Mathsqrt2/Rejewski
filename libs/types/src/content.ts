export type ContentStorage = { [key: string]: (p?: string, a?: string) => string };
export type NotFoundSubject = `Role` | `Guild` | `Member` | `Phrases`;
export type ActionSuspendedSubject = `role` | `missingMembers` | `unpermittedUsage` | `unpermittedInteraction`
    | `realUserMessageInDevMode` | `realUserJoinedInDevMode` | `messageOnRealChannelInDevMode`
    | `realUserInteractionInDevMode` | `realChannelInteractionInDevMode`