import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Chat {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 512 })
    discordChatId: string;

    @Column({ type: `int`, nullable: true })
    userId: number;

    @ManyToOne(() => User, user => user.chats, { nullable: true })
    @JoinColumn({ name: `userId` })
    assignedUser?: User

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp`, nullable: true })
    updatedAt: Date;

}