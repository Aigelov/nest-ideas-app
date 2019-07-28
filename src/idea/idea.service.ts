import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

import {IdeaDTO} from './idea.dto';
import {IdeaEntity} from './idea.entity';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>
  ) {}

  async showAllIdeas() {
    return await this.ideaRepository.find();
  }

  async createIdea(data: IdeaDTO) {
    const idea = await this.ideaRepository.create(data);
    await this.ideaRepository.save(idea);
    return idea;
  }

  async readIdea(id: string) {
    return await this.ideaRepository.findOne({
      where: { id }
    });
  }

  async updateIdea(id: string, data: Partial<IdeaDTO>) {
    await this.ideaRepository.update({ id }, data);
    return await this.ideaRepository.findOne({ id });
  }

  async destroyIdea(id: string) {
    await this.ideaRepository.delete({ id });
    return { deleted: true };
  }
}
