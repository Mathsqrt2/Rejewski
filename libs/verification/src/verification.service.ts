import { Injectable } from '@nestjs/common';

@Injectable()
export class VerificationService {

    public generateCode = (): string => {
        return '692 137 420';
    }
}
