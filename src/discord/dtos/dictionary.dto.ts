import { IsArray, ValidateNested } from "class-validator";
import { CreatePhraseDto } from "./create-phrase.dto";
import { Type } from "class-transformer";

export class DictionaryDto {

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePhraseDto)
    phrases: CreatePhraseDto[];

}