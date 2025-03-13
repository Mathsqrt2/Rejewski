import { IsString, MaxLength, MinLength } from "class-validator";

export class ChannelDto {

    @IsString()
    @MinLength(18)
    @MaxLength(20)
    channelId: string;

}