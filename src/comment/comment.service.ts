import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {CommentEntity} from "./comment.entity";
import {Repository} from "typeorm";
import {IdeaEntity} from "../idea/idea.entity";
import {UserEntity} from "../user/user.entity";
import {CommentDto} from "./comment.dto";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  private toResponseObject(comment: CommentEntity) {
    const responseObject: any = comment;
    if (comment.user) {
      responseObject.user = comment.user.toResponseObject(false);
    }
    return responseObject;
  }

  async showByIdea(id: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['comments', 'comments.user', 'comments.idea']
    });
    return idea.comments.map(
      comment => this.toResponseObject(comment)
    );
  }

  async showByUser(id: string) {
    const comments = await this.commentRepository.find({
      where: { user: { id } },
      relations: ['user']
    });
    return comments.map(
      comment => this.toResponseObject(comment)
    );
  }

  async show(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'idea']
    });
    return this.toResponseObject(comment);
  }

  async create(ideaId: string, userId: string, data: CommentDto) {
    const idea = await this.ideaRepository.findOne({
      where: { id: ideaId }
    });
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });
    const comment = await this.commentRepository.create({
      ...data,
      idea,
      user: user
    });
    await this.commentRepository.save(comment);
    return this.toResponseObject(comment);
  }

  async destroy(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'idea']
    });
    if (comment.user.id !== userId) {
      throw new HttpException(
        'You do not own this comment',
        HttpStatus.UNAUTHORIZED
      );
    }
    await this.commentRepository.remove(comment);
    return this.toResponseObject(comment);
  }
}
