import {
    Column, CreateDateColumn, Entity, JoinColumn,
    OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { Email } from "./email.entity";
import { Channel } from "./channel.entity";
import { Code } from "./code.entity";
import { Request } from "./request.entity";

@Entity({ name: `members` })
export class Member {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 128 })
    discordIdHash: string;

    @Column({ type: `boolean`, default: false })
    isConfirmed: boolean;

    @Column({ type: `boolean`, default: false })
    isBanned: boolean;

    @Column({ type: `boolean`, default: false })
    isAdmin: boolean;

    @Column({ type: `boolean`, default: false })
    isTester: boolean;

    @Column({ type: `boolean`, default: false })
    acceptedRules: boolean;

    @OneToOne(() => Email, email => email.assignedMember, { nullable: true })
    @JoinColumn()
    assignedEmail: Email;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp`, nullable: true, default: null, update: true, insert: false })
    updatedAt?: Date;

    @OneToMany(() => Channel, chat => chat.assignedMember, { nullable: true })
    @JoinColumn()
    channels: Channel[];

    @OneToMany(() => Code, code => code.assignedMember, { nullable: true })
    @JoinColumn()
    codes: Code[];

    @OneToMany(() => Request, request => request.assignedMember, { nullable: true })
    @JoinColumn()
    requests: Request[];

}