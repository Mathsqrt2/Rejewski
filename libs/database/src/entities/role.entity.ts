import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: `roles` })
export class LocalRole {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 128 })
    discordRoleId: string;

    @Column({ type: `varchar`, length: 128 })
    name: string;

    @Column({ type: `int`, nullable: true, default: null })
    groupId?: number;

    @Column({ type: `boolean`, default: false })
    isAdmin: boolean;

    @Column({ type: `boolean`, default: false })
    isMember: boolean;

    @Column({ type: `boolean`, default: false })
    isVerified: boolean;

    @Column({ type: `boolean`, default: false })
    isDeleted: boolean;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp`, nullable: true, default: null })
    updatedAt?: Date;

}