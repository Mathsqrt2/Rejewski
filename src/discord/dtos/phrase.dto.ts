import { IsDefined, IsString } from "class-validator";

export class PhraseDto {

    @IsString()
    @IsDefined()
    phrase: string;

}