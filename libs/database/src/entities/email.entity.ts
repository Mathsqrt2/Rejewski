import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Code } from "./code.entity";

@Entity({ name: `emails` })
export class Email {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 128 })
    emailHash: string;

    @Column({ type: `int`, nullable: true })
    confirmedById: number;

    @OneToOne(() => User, user => user.assignedEmail, { nullable: true })
    @JoinColumn()
    assignedUser: User;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp`, nullable: true })
    updatedAt: Date;

    @OneToMany(() => Code, code => code.assignedEmail)
    codes: Code[]

}