import {Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards, UsePipes} from '@nestjs/common';

import {IdeaDTO} from './idea.dto';
import {IdeaService} from './idea.service';
import {ValidationPipe} from '../shared/validation.pipe';
import {AuthGuard} from '../shared/auth.guard';
import {User} from '../user/user.decorator';

@Controller('api/ideas')
export class IdeaController {
  private logger = new Logger('IdeaController');

  constructor(
    private ideaService: IdeaService
  ) {}

  private logData(options: any) {
    options.user && this.logger.log(`USER ${JSON.stringify(options.user)}`);
    options.data && this.logger.log(`DATA ${JSON.stringify(options.data)}`);
    options.id && this.logger.log(`IDEA ${JSON.stringify(options.id)}`);
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
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  updateIdea(
    @Param('id') id: string,
    @User('id') user: string,
    @Body() data: Partial<IdeaDTO>
  ) {
    this.logData({ id, user, data });
    return this.ideaService.updateIdea(id, user, data);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  destroyIdea(
    @Param('id') id: string,
    @User('id') user
  ) {
    this.logData({ id, user });
    return this.ideaService.destroyIdea(id, user);
  }
}
