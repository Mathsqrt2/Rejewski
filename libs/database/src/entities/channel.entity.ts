import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: `channels` })
export class Channel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 512 })
    discordChannelId: string;

    @Column({ type: `boolean`, default: false })
    isDeleted: boolean;

    @Column({ type: `int`, nullable: true })
    userId?: number;

    @ManyToOne(() => User, user => user.channels, { nullable: true })
    @JoinColumn({ name: `userId` })
    assignedUser?: User

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp`, nullable: true })
    updatedAt?: Date;

}