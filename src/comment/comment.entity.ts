import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { IdeaEntity } from '../idea/idea.entity';

@Entity('comment')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @Column('text')
  comment: string;

  @ManyToOne(type => UserEntity)
  @JoinTable()
  user: UserEntity;

  @ManyToOne(type => IdeaEntity, idea => idea.comments)
  idea: IdeaEntity;
}
