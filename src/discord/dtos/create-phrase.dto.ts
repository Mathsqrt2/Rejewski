import { IsBoolean, IsOptional } from "class-validator";
import { PhraseDto } from "./phrase.dto";

export class CreatePhraseDto extends PhraseDto {

    @IsBoolean()
    @IsOptional()
    isUrl?: boolean;

}