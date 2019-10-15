import {Args, Parent, Query, ResolveProperty, Resolver} from '@nestjs/graphql';

import {IdeaService} from './idea.service';
import {CommentService} from '../comment/comment.service';

@Resolver()
export class IdeaResolver {
  constructor(
    private ideaService: IdeaService,
    private commentService: CommentService
  ) {}

  @Query()
  ideas(
    @Args('page') page: number,
    @Args('newest') newest: boolean
  ) {
    return this.ideaService.showAllIdeas(page, newest);
  }

  @ResolveProperty()
  comments(@Parent() idea) {
    const {id} = idea;
    return this.commentService.showByIdea(id);
  }
}