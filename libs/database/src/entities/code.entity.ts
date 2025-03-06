import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Email } from "./email.entity";

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

    @Column({ type: 'date' })
    expireDate: Date;

    @CreateDateColumn()
    createdAt: Date;

}