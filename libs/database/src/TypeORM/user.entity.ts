import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Email } from "./email.entity";
import { Chat } from "./chat.entity";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 128 })
    discordIdHash: string;

    @Column({ type: `boolean`, default: false })
    isBanned: boolean;

    @Column({ type: `boolean`, default: false })
    isAdmin: boolean;

    @OneToOne(() => Email, email => email.assignedUser)
    @JoinColumn()
    assignedEmail: Email;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp`, nullable: true })
    updatedAt: Date;

    @OneToMany(() => Chat, chat => chat.assignedUser)
    @JoinColumn()
    chats: Chat[];

}