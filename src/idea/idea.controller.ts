import {Body, Controller, Delete, Get, Logger, Param, Post, Put, UsePipes} from '@nestjs/common';

import {IdeaDTO} from './idea.dto';
import {IdeaService} from './idea.service';
import {ValidationPipe} from '../shared/validation.pipe';

@Controller('idea')
export class IdeaController {
  private logger = new Logger('IdeaController');

  constructor(
    private ideaService: IdeaService
  ) {}

  @Get()
  showAllIdeas() {
    return this.ideaService.showAllIdeas();
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createIdea(@Body() data: IdeaDTO) {
    this.logger.log(JSON.stringify(data));
    return this.ideaService.createIdea(data);
  }

  @Get(':id')
  readIdea(@Param('id') id: string) {
    return this.ideaService.readIdea(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  updateIdea(
    @Param('id') id: string,
    @Body() data: Partial<IdeaDTO>
  ) {
    this.logger.log(JSON.stringify(data));
    return this.ideaService.updateIdea(id, data);
  }

  @Delete(':id')
  destroyIdea(@Param('id') id: string) {
    return this.ideaService.destroyIdea(id);
  }
}
