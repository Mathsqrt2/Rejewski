import { AppModes } from "@libs/enums/app-modes.enum";
import { AppMode } from "@libs/types/modes";
import { IsBoolean, IsDefined, IsEnum } from "class-validator";

export class AppStateDto {

    @IsDefined()
    @IsEnum(AppModes)
    mode: AppMode;

    @IsDefined()
    @IsBoolean()
    shouldBeLogsArchived: boolean;

    @IsDefined()
    @IsBoolean()
    shouldLog: boolean;

}