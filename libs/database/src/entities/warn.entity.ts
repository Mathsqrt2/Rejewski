import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { Member } from "./member.entity";

@Entity({ name: `warns` })
export class Warn {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 4096 })
    reason: string;

    @Column({ type: `int` })
    memberId: number;

    @ManyToOne(() => Member, member => member.warns, { nullable: true })
    @JoinColumn({ name: `memberId` })
    assignedMember: Member;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp` })
    updatedAt: Date;

}