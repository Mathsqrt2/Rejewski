export type LoggerConfig = {
    context?: unknown,
    save?: boolean,
    tag?: string,
    startTime?: number,
    display?: boolean,
}

export type ErrorConfig = LoggerConfig & {
    error?: Error | string,
    displayError?: boolean,
}