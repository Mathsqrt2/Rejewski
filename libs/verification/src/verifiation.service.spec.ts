import { Request } from "@libs/database/entities/request.entity";
import { Email } from "@libs/database/entities/email.entity";
import { VerificationService } from "./verification.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Code } from "@libs/database/entities/code.entity";
import { Test } from "@nestjs/testing";

describe('VerificationService', () => {
    let verificationService: VerificationService;

    const mockRequest = { id: 1 } as Request;
    const mockEmail = { id: 1000 } as Email;

    const mockCodeRepo = {
        save: jest.fn().mockImplementation((entity): Promise<Code> => {
            const savedCode = {
                id: 1,
                emailId: entity.emailId,
                value: entity.value,
                expireDate: entity.expireDate,
                createdAt: new Date(),
                request: entity.request
            } as Code;
            return Promise.resolve(savedCode);
        })
    };

    const mockRequestRepo = {
        save: jest.fn().mockImplementation((entity): Promise<Request> =>
            Promise.resolve(entity as Request)
        )
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                VerificationService,
                {
                    provide: getRepositoryToken(Request),
                    useValue: mockRequestRepo
                },
                {
                    provide: getRepositoryToken(Code),
                    useValue: mockCodeRepo
                }
            ]
        }).compile();

        verificationService = moduleRef.get<VerificationService>(VerificationService);
    });

    it('Should generate six digits code', async () => {
        const code = await verificationService.generateCode(mockRequest, mockEmail);

        expect(code).toBeDefined();
        expect(code.value).toHaveLength(6);
        expect(code.value).toMatch(/^\d{6}$/);
        expect(code.emailId).toBe(mockEmail.id);
        expect(code.request).toBe(mockRequest);
        expect(code.expireDate).toBeDefined();
    });
});