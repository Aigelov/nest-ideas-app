import {Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards, UsePipes} from '@nestjs/common';

import {IdeaDTO} from './idea.dto';
import {IdeaService} from './idea.service';
import {ValidationPipe} from '../shared/validation.pipe';
import {AuthGuard} from "../shared/auth.guard";
import {User} from "../user/user.decorator";

@Controller('api/ideas')
export class IdeaController {
  private logger = new Logger('IdeaController');

  constructor(
    private ideaService: IdeaService
  ) {}

  private logData(options: any) {
    options.user && this.logger.log(`USER ${JSON.stringify(options.user)}`);
    options.data && this.logger.log(`DATA ${JSON.stringify(options.data)}`);
    options.id && this.logger.log(`IDEA ${JSON.stringify((options.id))}`);
  }

  @Get()
  showAllIdeas() {
    return this.ideaService.showAllIdeas();
  }

  @Post()
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createIdea(@User('id') user, @Body() data: IdeaDTO) {
    this.logData({ user, data });
    return this.ideaService.createIdea(user, data);
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
