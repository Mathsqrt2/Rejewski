import {
    Column, CreateDateColumn, Entity,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity({ name: 'logs' })
export class Log {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `text` })
    content: string;

    @Column({ type: `text`, nullable: true })
    error?: string;

    @Column({ type: `varchar`, nullable: true, length: 256 })
    label?: string;

    @Column({ type: `varchar`, nullable: true, length: 128 })
    tag?: string;

    @Column({ type: `int`, nullable: true })
    duration?: number;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

}