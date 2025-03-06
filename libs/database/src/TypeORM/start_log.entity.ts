import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StartLog {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 64 })
    bot: string;

    @Column({ type: `varchar`, length: 64 })
    botId: string;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

}