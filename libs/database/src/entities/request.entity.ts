import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Member } from "./member.entity";
import { Email } from "./email.entity";


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

    @Column({ type: `varchar`, length: 32 })
    code: string;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date

}