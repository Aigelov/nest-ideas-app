import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdeaDTO, IdeaRO } from './idea.dto';
import { IdeaEntity } from './idea.entity';
import { UserEntity } from '../user/user.entity';
import { Votes } from '../shared/votes.enum';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
  }

  private async vote(
    idea: IdeaEntity,
    user: UserEntity,
    vote: Votes,
  ) {
    const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;
    if (
      idea[opposite].filter(voter => voter.id === user.id).length > 0 ||
      idea[vote].filter(voter => voter.id === user.id).length > 0
    ) {
      idea[opposite] = idea[opposite].filter(
        voter => voter.id !== user.id,
      );
      idea[vote] = idea[vote].filter(
        voter => voter.id !== user.id,
      );
      await this.ideaRepository.save(idea);
    } else if (
      idea[vote].filter(voter => voter.id === user.id).length < 1
    ) {
      idea[vote].push(user);
      await this.ideaRepository.save(idea);
    } else {
      throw new HttpException(
        'Unable to cast vote',
        HttpStatus.BAD_REQUEST,
      );
    }
    return idea;
  }

  async showAllIdeas(page: number = 1, newest?: boolean): Promise<IdeaRO[]> {
    try {
      const ideas = await this.ideaRepository.find({
        relations: ['user', 'upvotes', 'downvotes', 'comments'],
        take: 10,
        skip: 10 * (page - 1),
        order: newest && { created: 'DESC' },
      });
      return ideas.map(idea => this.toResponseObject(idea));
    } catch (err) {
      throw new HttpException(`Bad query ${err}`, HttpStatus.BAD_REQUEST);
    }
  }

  async createIdea(userId: string, data: IdeaDTO): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    const idea = await this.ideaRepository.create({
      ...data,
      user,
    });
    await this.ideaRepository.save(idea);
    return this.toResponseObject(idea);
  }

  async readIdea(id: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['user', 'upvotes', 'downvotes', 'comments'],
    });
    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return this.toResponseObject(idea);
  }

  async updateIdea(
    id: string,
    userId: string,
    data: Partial<IdeaDTO>,
  ): Promise<IdeaRO> {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['user', 'comments'],
    });
    return this.toResponseObject(idea);
  }

  async destroyIdea(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['user', 'comments'],
    });
    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.delete({ id });
    return this.toResponseObject(idea);
  }

  async upvote(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['user', 'upvotes', 'downvotes', 'comments'],
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    idea = await this.vote(idea, user, Votes.UP);
    return this.toResponseObject(idea);
  }

  async downvote(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['user', 'upvotes', 'downvotes', 'comments'],
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    idea = await this.vote(idea, user, Votes.DOWN);
    return this.toResponseObject(idea);
  }

  async bookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });
    if (
      user.bookmarks.filter(
        bookmark => bookmark.id === idea.id,
      ).length < 1
    ) {
      user.bookmarks.push(idea);
      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Idea already bookmarked',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user.toResponseObject();
  }

  async unBookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });
    if (
      user.bookmarks.filter(
        bookmark => bookmark.id === idea.id,
      ).length > 0
    ) {
      user.bookmarks = user.bookmarks.filter(
        bookmark => bookmark.id !== idea.id,
      );
      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Idea already bookmarked',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user.toResponseObject();
  }

  private toResponseObject(idea: IdeaEntity): IdeaRO {
    const responseObject: any = {
      ...idea,
      user: idea.user.toResponseObject(false),
    };
    if (responseObject.upvotes) {
      responseObject.upvotes = idea.upvotes.length;
    }
    if (responseObject.downvotes) {
      responseObject.downvotes = idea.downvotes.length;
    }
    return responseObject;
  }

  private ensureOwnership(
    idea: IdeaEntity,
    userId: string,
  ) {
    if (idea.user.id !== userId) {
      throw new HttpException(
        'Incorrect user',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // async showAllIdeasWithQueryBuilder(): Promise<IdeaRO[]> {
  //   try {
  //     const queryBuilder = await getRepository(IdeaEntity)
  //       .createQueryBuilder('idea')
  //       .leftJoinAndSelect('idea.user', 'user');
  //     queryBuilder.where('1 = 1');
  //     queryBuilder.orderBy('idea.idea', 'DESC');
  //     const ideasCount = await queryBuilder.getCount();
  //     const ideas = await queryBuilder.getMany();
  //     return { ideasCount, ideas };
  //   } catch (err) {
  //     throw new HttpException(`Bad query ${err}`, HttpStatus.BAD_REQUEST)
  //   }
  // }
}
