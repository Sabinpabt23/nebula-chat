/**
 * Conversation Entity
 * * Database model representing a chat room or discussion channel within the application.
 * It manages metadata for communication contexts—supporting both private direct 
 * messaging (DMs) and multi-user group chats.
 * * Inherited Fields:
 * - id (UUID), createdAt (TIMESTAMPTZ), updatedAt (TIMESTAMPTZ) via {@link BaseEntity}
 * * Fields:
 * - type         (VARCHAR) — Discriminator mapping the room structure ('DIRECT' or 'GROUP')
 * - name         (VARCHAR) — The display title of the chat (nullable; typically null for DMs)
 * - avatarUrl    (TEXT)    — Image URL for group chat icons (nullable)
 * - createdById  (UUID)    — Foreign key identifying the creator/admin (nullable for system or auto-created rooms)
 * * Relationships:
 * - ManyToOne (createdBy)  — Links to the User who initialized the conversation
 * - OneToMany (participants)— Collection of users joined to this channel via the Participant bridge table
 * - OneToMany (messages)    — Stream of message entries historical to this specific room
 */

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