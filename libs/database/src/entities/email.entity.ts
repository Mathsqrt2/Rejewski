import {
    Column, CreateDateColumn, Entity, JoinColumn,
    OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { Member } from "./member.entity";
import { Code } from "./code.entity";
import { Request } from "./request.entity";

@Entity({ name: `emails` })
export class Email {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 128 })
    emailHash: string;

    @Column({ type: `int`, nullable: true })
    memberId?: number;

    @OneToOne(() => Member, member => member.assignedEmail, { nullable: true, onDelete: `CASCADE` })
    @JoinColumn({ name: `memberId` })
    assignedMember: Member;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp`, nullable: true, default: null, update: true, insert: false })
    updatedAt: Date;

    @OneToMany(() => Code, code => code.assignedEmail)
    codes: Code[]

    @OneToMany(() => Request, request => request.assignedMember)
    @JoinColumn()
    requests: Request[];

}