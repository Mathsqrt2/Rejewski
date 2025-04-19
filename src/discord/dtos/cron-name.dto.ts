import { CronJobs } from "@libs/enums/cron.enum";
import { IsDefined, IsEnum } from "class-validator";

export class CronNameDto {

    @IsDefined()
    @IsEnum(CronJobs)
    cronName: CronJobs;

}