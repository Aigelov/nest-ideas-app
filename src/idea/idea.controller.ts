import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';

import {IdeaDTO} from './idea.dto';
import {IdeaService} from './idea.service';

@Controller('idea')
export class IdeaController {
  constructor(
    private ideaService: IdeaService
  ) {}

  @Get()
  showAllIdeas() {
    return this.ideaService.showAllIdeas();
  }

  @Post()
  createIdea(@Body() data: IdeaDTO) {
    return this.ideaService.createIdea(data);
  }

  @Get(':id')
  readIdea(@Param('id') id: string) {
    return this.ideaService.readIdea(id);
  }

  @Put(':id')
  updateIdea(
    @Param('id') id: string,
    @Body() data: Partial<IdeaDTO>
  ) {
    return this.ideaService.updateIdea(id, data);
  }

  @Delete(':id')
  destroyIdea(@Param('id') id: string) {
    return this.ideaService.destroyIdea(id);
  }
}
