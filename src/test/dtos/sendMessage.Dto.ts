import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";
import { BotResponse } from "@libs/enums";

export class SendMessageDto {

    @IsString()
    @MinLength(18)
    @MaxLength(20)
    channelId: string;

    @IsEnum(BotResponse)
    messageType: BotResponse;

}