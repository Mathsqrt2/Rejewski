import { HttpStatus, Injectable, Logger as NestLogger, NestMiddleware } from '@nestjs/common';
import { ErrorConfig, LoggerConfig } from '@libs/types/logs';
import { Log } from '@libs/database/entities/log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingsService } from '@libs/settings';
import { Repository } from 'typeorm';
import { Content } from 'src/app.content';
import { LogsTypes } from '@libs/enums';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class Logger implements NestMiddleware {

    private logger: NestLogger;
    private textFieldMaxLength = 65534;

    constructor(
        @InjectRepository(Log) private readonly logs: Repository<Log>,
        private readonly settings: SettingsService,
    ) {
        this.logger = new NestLogger(this.settings.app.name);
    }

    use = (req: Request, res: Response, next: NextFunction) => {

        const startTime = Date.now();
        const code = res.statusCode;

        res.on('finish', () => {

            const message = `method: "${req.method}", origin: "${req.originalUrl}", code: "${code}"`;
            if (code === HttpStatus.ACCEPTED || code === HttpStatus.OK || code === HttpStatus.FOUND) {
                this.log(message, { startTime, tag: LogsTypes.RESPONSE_SUCCESS });
            } else {
                this.warn(message, { startTime, tag: LogsTypes.RESPONSE_FAIL });
            }

        });

        next();
    }

    private shouldLog = (): boolean => this.settings.app.state.shouldLog;
    private shouldSave = (): boolean => this.settings.app.state.shouldBeLogsArchived;

    public log = (message: any, config?: LoggerConfig): void => {

        const context = config?.context || null;
        const save = config?.save ?? this.shouldSave();
        const content = message?.toString().substring(0, this.textFieldMaxLength);
        const display = config?.display ?? true;

        if (save) {
            this.logs.save({
                content,
                label: `LOG`,
                tag: config?.tag ?? null,
                duration: config?.startTime ? Date.now() - config.startTime : null,
            }).catch(error => {
                this.error(Content.error.failedToSaveLog(`log`), { error });
            });
        }

        if (!this.shouldLog() || !display) {
            return;
        }

        context
            ? NestLogger.log(message, context)
            : this.logger.log(message)
    }

    public warn = (message: any, config?: LoggerConfig): void => {

        const context = config?.context ?? null;
        const save = config?.save ?? this.shouldSave();
        const content = message?.toString().substring(0, this.textFieldMaxLength);
        const display = config?.display ?? true;

        if (save) {
            this.logs.save({
                content,
                label: `WARN`,
                tag: config?.tag || null,
                duration: config?.startTime ? Date.now() - config.startTime : null,
            }).catch(error => {
                this.error(Content.error.failedToSaveLog(`warn`), { error });
            });
        }

        if (!this.shouldLog() || !display) {
            return;
        }

        context
            ? NestLogger.warn(message, context)
            : this.logger.warn(message)
    }

    public error = (message: any, config?: ErrorConfig): void => {

        const context = config?.context ?? null;
        const save = config?.save ?? this.shouldSave();
        const error = config?.error ?? null;
        const content = message?.toString().substring(0, this.textFieldMaxLength);
        const display = config?.display ?? true;
        const displayError = config?.displayError ?? true;

        const errorMessage: string = config?.error
            ? typeof config.error === `string`
                ? config.error
                : config.error.message
            : null;

        if (save) {
            this.logs.save({
                content,
                label: `ERROR`,
                error: errorMessage,
                tag: config?.tag ?? null,
                duration: config?.startTime ? Date.now() - config.startTime : null,
            }).catch(error => {
                this.error(Content.error.failedToSaveLog(`error`), { error });
            });
        }

        if (!this.shouldLog() || !display) {
            return;
        }

        context
            ? NestLogger.error(message, context)
            : this.logger.error(message);

        if (error && displayError) {
            const errorMessage: string = typeof error === `string` ? error : error.message;
            context
                ? NestLogger.error(errorMessage, context)
                : this.logger.error(errorMessage);
        }
    }

    public debug = (message: any, config?: LoggerConfig): void => {

        const context = config?.context ?? null;
        const save = config?.save ?? this.shouldSave();
        const content = message?.toString().substring(0, this.textFieldMaxLength);
        const display = config?.display ?? true;

        if (save) {
            this.logs.save({
                content,
                label: `DEBUG`,
                tag: config?.tag ?? null,
                duration: config?.startTime ? Date.now() - config.startTime : null,
            }).catch(error => {
                this.error(Content.error.failedToSaveLog(`debug`), { error });
            });
        }

        if (!this.shouldLog() || !display) {
            return;
        }

        context
            ? NestLogger.debug(message, context)
            : this.logger.debug(message);
    }
}