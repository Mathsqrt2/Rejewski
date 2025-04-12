import {
    Column, CreateDateColumn, Entity, JoinColumn,
    ManyToOne, OneToOne, PrimaryGeneratedColumn
} from "typeorm";
import { Member } from "./member.entity";
import { Email } from "./email.entity";
import { Code } from "./code.entity";

@Entity({ name: `requests` })
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

    @OneToOne(() => Code, code => code.request, { nullable: true, onDelete: `CASCADE` })
    @JoinColumn()
    code: Code;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date

}