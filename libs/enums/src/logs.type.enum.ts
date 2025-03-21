export enum LogsTypes {
    INTERNAL_ACTION_FAIL = "INTERNAL_ACTION_FAIL",
    INTERNAL_ACTION = "INTERNAL_ACTION",
    UNKNOWN_CHANNEL = "UNKNOWN_CHANNEL",
    CHANNEL_CREATED = "CHANNEL_CREATED",
    CHANNEL_CREATE_FAIL = "CHANNEL_CREATE_FAIL",
    CHANNEL_REMOVED = "CHANNEL_REMOVED",
    USER_JOINED = "USER_JOINED",
    USER_LEFT = "USER_LEFT",
    PERMISSIONS_FAIL = "PERMISSIONS_FAIL",
    PERMISSIONS_GRANTED = "PERMISSIONS_GRANTED",
    PERMISSIONS_REVOKED = "PERMISSIONS_REVOKED",
    DATABASE_FAIL = "DATABASE_FAIL",
    DATABASE_READ = "DATABASE_READ",
    DATABASE_WRITE = "DATABASE_WRITE",
    INVALID_PAYLOAD = "INVALID_PAYLOAD",
    EVENT_EMITTED = "EVENT_EMITTED",
    VALIDATION_FAIL = "VALIDATION_FAIL",
}