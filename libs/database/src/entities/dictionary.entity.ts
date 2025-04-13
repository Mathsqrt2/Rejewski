import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: `dictionaries` })
export class Dictionary {

    @PrimaryGeneratedColumn({ type: `int` })
    id: number;

    @Column({ type: `varchar`, length: 128 })
    phrase: string;

    @Column({ type: `boolean`, default: false })
    isUrl: boolean;

    @Column({ type: `boolean`, default: false })
    blackList: boolean;

    @Column({ type: `boolean`, default: false })
    whiteList: boolean;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp`, nullable: true, default: null })
    updatedAt?: Date;

}