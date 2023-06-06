import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
// import { Request } from 'express';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dto';

@UseGuards(JwtGuard) // or @AuthGuard('jwt')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  // or getme(@Req() req: Request)
  getme(@GetUser() user: User) {
    // @GetUser('email') email: string
    // console.log(email);
    // console.log({ user: user });

    return user;
  }

  @Patch('updateMe')
  updateMe(@Body() dto: UpdateUserDTO, @GetUser('id') userId: number) {
    return this.userService.updateUser(userId, dto);
  }
}
