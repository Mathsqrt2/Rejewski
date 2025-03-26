import { AppConfig } from '@libs/types/settings';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {

    public app: AppConfig = {
        name: `RejewskiBot`,
        state: {
            mode: 'DEVELOPMENT',
            shouldBeLogsArchived: true,
            shouldLog: true,
        }
    };
}
