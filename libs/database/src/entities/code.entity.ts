import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Email } from "./email.entity";
import { User } from "./user.entity";

@Entity({ name: `codes` })
export class Code {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 8 })
    code: string

    @Column({ type: `int` })
    emailId: number;

    @ManyToOne(() => Email, email => email.codes)
    @JoinColumn()
    assignedEmail: Email;

    @Column({ type: `int` })
    userId: number;

    @ManyToOne(() => User, user => user.codes)
    @JoinColumn({ name: `userId` })
    assignedUser: User;

    @Column({ type: 'timestamp' })
    expireDate: Date;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

}