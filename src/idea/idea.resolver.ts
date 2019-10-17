import {Args, Context, Mutation, Parent, Query, ResolveProperty, Resolver} from '@nestjs/graphql';
import {UseGuards} from '@nestjs/common';

import {IdeaService} from './idea.service';
import {CommentService} from '../comment/comment.service';
import {AuthGuard} from '../shared/auth.guard';
import {IdeaDTO} from './idea.dto';

@Resolver()
export class IdeaResolver {
  constructor(
    private ideaService: IdeaService,
    private commentService: CommentService
  ) {}

  @Query()
  async ideas(
    @Args('page') page: number,
    @Args('newest') newest: boolean
  ) {
    return await this.ideaService.showAllIdeas(page, newest);
  }

  @Query()
  async idea(@Args('id') id: string) {
    return await this.ideaService.readIdea(id);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async createIdea(
    @Args('idea') idea: string,
    @Args('description') description: string,
    @Context('user') user
  ) {
    const data: IdeaDTO = {idea, description};
    const {id: userId} = user;
    return await this.ideaService.createIdea(userId, data);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async updateIdea(
    @Args('id') id: string,
    @Args('idea') idea: string,
    @Args('description') description: string,
    @Context('user') user
  ) {
    const data: IdeaDTO = {idea, description};
    const {id: userId} = user;
    return await this.ideaService.updateIdea(id, userId, data);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async deleteIdea(
    @Args('id') id: string,
    @Context('user') user
  ) {
    const {id: userId} = user;
    return await this.ideaService.destroyIdea(id, userId);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async upvote(
    @Args('id') id: string,
    @Context('user') user
  ) {
    const {id: userId} = user;
    return await this.ideaService.upvote(id, userId);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async downvote(
    @Args('id') id: string,
    @Context('user') user
  ) {
    const {id: userId} = user;
    return await this.ideaService.downvote(id, userId);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async bookmark(
    @Args('id') id: string,
    @Context('user') user
  ) {
    const {id: userId} = user;
    return await this.ideaService.bookmark(id, userId);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async unBookmark(
    @Args('id') id: string,
    @Context('user') user
  ) {
    const {id: userId} = user;
    return await this.ideaService.unBookmark(id, userId);
  }

  @ResolveProperty()
  comments(@Parent() idea) {
    const {id} = idea;
    return this.commentService.showByIdea(id);
  }
}