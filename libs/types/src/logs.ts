export type LoggerConfig = {
    context?: unknown,
    save?: boolean,
    tag?: string,
}

export type ErrorConfig = LoggerConfig & {
    error?: Error | string,
}