import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: `descriptions` })
export class Description {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 256 })
    value: string;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

    @UpdateDateColumn({ type: `timestamp` })
    updatedAt: Date;

}