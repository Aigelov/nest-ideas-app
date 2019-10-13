import {Body, Controller, Get, Post, Query, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';

import {UserService} from './user.service';
import {UserDTO} from './user.dto';
import {AuthGuard} from '../shared/auth.guard';
import {User} from './user.decorator';

@Controller()
export class UserController {
  constructor(
    private userService: UserService
  ) {}

  @Get('api/users')
  showAllUsers(@Query('page') page: number) {
    return this.userService.showAll(page);
  }

  @Post('/login')
  @UsePipes(new ValidationPipe())
  login(@Body() data: UserDTO) {
    return this.userService.login(data);
  }

  @Post('register')
  register(@Body() data: UserDTO) {
    return this.userService.register(data);
  }
}
