import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Participant } from './Participant';
import { Message } from './Message';

@Entity('conversations')
export class Conversation extends BaseEntity {
    @Column({ type: 'varchar', length: 10, name: 'type' })
    type!: 'DIRECT' | 'GROUP';

    @Column({ type: 'varchar', length: 100, nullable: true })
    name!: string | null;

    @Column({ type: 'text', nullable: true, name: 'avatar_url' })
    avatarUrl!: string | null;

    @Column({ type: 'uuid', nullable: true, name: 'created_by' })
    createdById!: string | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    createdBy!: User | null;

    @OneToMany(() => Participant, (participant) => participant.conversation)
    participants!: Participant[];

    @OneToMany(() => Message, (message) => message.conversation)
    messages!: Message[];
}