import {
    Column, CreateDateColumn, Entity, JoinColumn,
    OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { Member } from "./member.entity";
import { Request } from "./request.entity";

@Entity({ name: `emails` })
export class Email {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 128 })
    emailHash: string;

    @Column({ type: `int`, nullable: true })
    memberId?: number;

    @Column({ type: `boolean`, default: false })
    isConfirmed?: boolean;

    @OneToOne(() => Member, member => member.assignedEmail, { nullable: true, onDelete: `CASCADE` })
    @JoinColumn({ name: `memberId` })
    assignedMember: Member;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp`, nullable: true, default: null, update: true, insert: false })
    updatedAt: Date;

    @OneToMany(() => Request, request => request.assignedMember)
    @JoinColumn()
    requests: Request[];

}