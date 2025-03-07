export type LoggerConfig = {
    context?: unknown,
    save?: boolean,
    tag?: string,
    startTime?: number,
}

export type ErrorConfig = LoggerConfig & {
    error?: Error | string,
}