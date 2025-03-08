import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Email } from "./email.entity";
import { Member } from "./member.entity";
import { Request } from "./request.entity";

@Entity({ name: `codes` })
export class Code {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 8 })
    code: string

    @Column({ type: `int` })
    emailId: number;

    @ManyToOne(() => Email, email => email.codes)
    @JoinColumn({ name: `emailId` })
    assignedEmail: Email;

    @Column({ type: `int` })
    memberId: number;

    @ManyToOne(() => Member, member => member.codes)
    @JoinColumn({ name: `userId` })
    assignedMember: Member;

    @Column({ type: 'timestamp' })
    expireDate: Date;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @OneToMany(() => Request, request => request.assignedMember)
    @JoinColumn()
    requests: Request[];
}