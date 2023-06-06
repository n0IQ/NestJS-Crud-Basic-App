import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  // Dependency Injection
  constructor(private authService: AuthService) {}

  // POST /auth/signup
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    // console.log({ dto });

    return this.authService.signup(dto);
  }

  //POST /auth/login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }
}
