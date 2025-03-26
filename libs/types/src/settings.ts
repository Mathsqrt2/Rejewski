import { AppMode } from "./modes"

export type AppConfig = {
    name: string,
    state: {
        mode: AppMode,
        shouldBeLogsArchived: boolean,
        shouldLog: boolean,
    }
} 