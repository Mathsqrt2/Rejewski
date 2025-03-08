import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Member } from "./member.entity";
import { Email } from "./email.entity";
import { Code } from "./code.entity";

@Entity()
export class Request {

    @PrimaryGeneratedColumn({ type: `int` })
    id: number;

    @Column({ type: `int` })
    memberId: number;

    @ManyToOne(() => Member, member => member.requests)
    @JoinColumn({ name: `memberId` })
    assignedMember: Member

    @Column({ type: `int` })
    emailId: number;

    @ManyToOne(() => Email, email => email.requests)
    @JoinColumn({ name: `emailId` })
    assignedEmail: Email;

    @Column({ type: `int` })
    codeId: number;

    @ManyToOne(() => Code, code => code.requests)
    @JoinColumn({ name: `codeId` })
    assignedCode: Code;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date

}