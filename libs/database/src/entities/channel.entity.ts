import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Member } from "./member.entity";

@Entity({ name: `channels` })
export class Channel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 512 })
    discordId: string;

    @Column({ type: `boolean`, default: false })
    isDeleted: boolean;

    @Column({ type: `boolean`, default: false })
    isPrivate: boolean;

    @Column({ type: `boolean`, default: false })
    isPersonal: boolean;

    @Column({ type: `boolean`, default: false })
    isAdministration: boolean;

    @Column({ type: `int`, nullable: true })
    memberId?: number;

    @ManyToOne(() => Member, member => member.channels, { nullable: true, onDelete: `CASCADE` })
    @JoinColumn({ name: `memberId` })
    assignedMember?: Member

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp`, nullable: true })
    updatedAt?: Date;

}