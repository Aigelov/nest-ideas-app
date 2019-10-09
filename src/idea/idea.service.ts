import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {getRepository, Repository} from 'typeorm';

import {IdeaDTO} from './idea.dto';
import {IdeaEntity} from './idea.entity';
import {UserEntity} from "../user/user.entity";

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  private toResponseObject(idea: IdeaEntity) {
    return {
      ...idea,
      user: idea.user.toResponseObject(false)
    }
  }

  async showAllIdeas() {
    try {
      const queryBuilder = await getRepository(IdeaEntity)
        .createQueryBuilder('idea')
        .leftJoinAndSelect('idea.user', 'user');
      queryBuilder.where('1 = 1');
      queryBuilder.orderBy('idea.idea', 'DESC');
      const ideasCount = await queryBuilder.getCount();
      const ideas = await queryBuilder.getMany();
      return { ideasCount, ideas };
      // const ideas = await this.ideaRepository.find({
      //   relations: ['user']
      // });
      // return ideas.map(idea => {
      //   console.log(idea);
      // });
    } catch (err) {
      throw new HttpException(`Bad query ${err}`, HttpStatus.BAD_REQUEST)
    }
  }

  async createIdea(userId: string, data: IdeaDTO) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId
      }
    });
    const idea = await this.ideaRepository.create({
      ...data,
      user: user
    });
    console.log({
      ...data,
      user: user
    });
    await this.ideaRepository.save(idea);
    return this.toResponseObject(idea);
  }

  async readIdea(id: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id }
    });
    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return idea;
  }

  async updateIdea(id: string, data: Partial<IdeaDTO>) {
    let idea = await this.ideaRepository.findOne({
      where: { id }
    });
    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({ where: { id } });
    return idea;
  }

  async destroyIdea(id: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id }
    });
    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    await this.ideaRepository.delete({ id });
    return idea;
  }
}
