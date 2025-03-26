import {
    Column, CreateDateColumn, Entity,
    JoinColumn, ManyToOne, OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { Request } from "./request.entity";

@Entity({ name: `codes` })
export class Code {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: `varchar`, length: 6 })
    code: string

    @Column({ type: `int` })
    emailId: number;

    @OneToOne(() => Request, request => request.code, { nullable: true })
    @JoinColumn()
    request: Request;

    @Column({ type: 'timestamp' })
    expireDate: Date;

    @CreateDateColumn({ type: `timestamp` })
    createdAt: Date;

}