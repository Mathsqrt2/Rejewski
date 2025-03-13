import { ChannelDto } from "./ChannelDto";
import { BotResponse } from "@libs/enums";
import { IsEnum } from "class-validator";

export class SendMessageDto extends ChannelDto {

    @IsEnum(BotResponse)
    messageType: BotResponse;

}