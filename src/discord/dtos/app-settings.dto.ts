import { IsDefined, IsString, ValidateNested } from "class-validator";
import { AppStateDto } from "./app-state.dto";
import { Type } from "class-transformer";

export class AppSettingsDto {

    @IsDefined()
    @IsString()
    name: string;

    @IsDefined()
    @ValidateNested({ each: true })
    @Type(() => AppStateDto)
    state: AppStateDto;

}