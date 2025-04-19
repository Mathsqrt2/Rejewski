import { AppServices } from "@libs/enums/services.enum";
import { IsDefined, IsEnum } from "class-validator";

export class AppServiceDto {

    @IsDefined()
    @IsEnum(AppServices)
    service: AppServices

}