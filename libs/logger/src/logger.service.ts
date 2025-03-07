import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { ErrorConfig, LoggerConfig } from '@libs/types/logs';
import { Log } from '@libs/database/entities/log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingsService } from '@libs/settings';
import { Repository } from 'typeorm';

@Injectable()
export class Logger {

    private appName: string = __dirname.split("\\").pop();
    private logger: NestLogger;

    constructor(
        @InjectRepository(Log) private readonly logs: Repository<Log>,
        private readonly settings: SettingsService,
    ) {
        this.logger = new NestLogger(this.appName);
    }

    private shouldLog = (): boolean => this.settings.app.state.shouldLog;
    private shouldSave = (): boolean => this.settings.app.state.shouldBeLogsArchived;

    public log = (message: any, config?: LoggerConfig): void => {

        const context = config?.context || null;
        const save = config?.save ?? this.shouldSave();

        if (save) {
            this.logs.save({
                content: message,
                label: `LOG`,
                tag: config?.tag || null,
                duration: config?.startTime ? Date.now() - config.startTime : null,
            }).catch(error => {
                this.error(`Failed to save log in database.`, { error });
            });
        }

        if (!this.shouldLog()) {
            return;
        }

        context
            ? NestLogger.log(message, context)
            : this.logger.log(message)
    }

    public warn = (message: any, config?: LoggerConfig): void => {

        const context = config?.context || null;
        const save = config?.save ?? this.shouldSave();

        if (save) {
            this.logs.save({
                content: message,
                label: `WARN`,
                tag: config?.tag || null,
                duration: config?.startTime ? Date.now() - config.startTime : null,
            }).catch(error => {
                this.error(`Failed to save warn in database.`, { error });
            });
        }

        if (!this.shouldLog()) {
            return;
        }

        context
            ? NestLogger.warn(message, context)
            : this.logger.warn(message)
    }

    public error = (message: any, config?: ErrorConfig): void => {

        const context = config?.context || null;
        const save = config?.save ?? this.shouldSave();
        const error = config?.error || null;

        const errorMessage: string = config?.error
            ? typeof config.error === `string`
                ? config.error
                : config.error.message
            : null;

        if (save) {
            this.logs.save({
                content: message,
                label: `ERROR`,
                error: errorMessage,
                tag: config?.tag || null,
                duration: config?.startTime ? Date.now() - config.startTime : null,
            }).catch(error => {
                this.error(`Failed to save error in database.`, { error });
            });
        }

        if (!this.shouldLog()) {
            return;
        }

        if (error) {
            this.logger.error(error);
        }

        context
            ? this.logger.error(message, context)
            : this.logger.error(message);
    }

    public debug = (message: any, config?: LoggerConfig): void => {

        const context = config?.context || null;
        const save = config?.save ?? this.shouldSave();

        if (save) {
            this.logs.save({
                content: message,
                label: `DEBUG`,
                tag: config?.tag || null,
                duration: config?.startTime ? Date.now() - config.startTime : null,
            }).catch(error => {
                this.error(`Failed to save debug in database.`, { error });
            });
        }

        if (!this.shouldLog()) {
            return;
        }

        context
            ? NestLogger.debug(message, context)
            : this.logger.debug(message);
    }
}