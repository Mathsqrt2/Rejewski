import { Code } from '@libs/database/entities/code.entity';
import { Email } from '@libs/database/entities/email.entity';
import { Member } from '@libs/database/entities/member.entity';
import { Injectable } from '@nestjs/common';
import { Request } from '@libs/database/entities/request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VerificationService {

    constructor(
        @InjectRepository(Request) private readonly request: Repository<Request>,
        @InjectRepository(Code) private readonly code: Repository<Code>,
    ) { }

    public generateCode = async (request: Request, email: Email): Promise<Code> => {

        let code: string = ``;
        for (let i = 0; i < 6; i++) {
            code += Math.floor(Math.random() * 9);
        }

        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const newCode = await this.code.save({
            emailId: email.id,
            request,
            code,
            expireDate: threeDaysFromNow,
        })

        request.code = newCode;
        await this.request.save(request);

        return newCode;
    }
}
