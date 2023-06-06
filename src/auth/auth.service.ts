import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    try {
      // hash the password
      const password = await argon.hash(dto.password.toString());

      // create and save new user
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email.toString(),
          password,
        },
      });

      delete newUser.password;

      const token = await this.signToken(newUser.id, newUser.email);

      return {
        statusCode: 201,
        status: 'success',
        message: 'Signed Up Successfully',
        token,
        data: {
          data: newUser,
        },
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credientials taken');
        }
      }

      throw error;
    }
  }

  async login(dto: AuthDto) {
    // check if user exist
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toString(),
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid Credientials');
    }

    // Check Password
    const isPasswordMatch = await argon.verify(
      user.password,
      dto.password.toString(),
    );

    if (!isPasswordMatch) {
      throw new ForbiddenException('Invalid Credientials');
    }

    delete user.password;
    const token = await this.signToken(user.id, user.email);

    return {
      statusCode: 200,
      status: 'success',
      message: 'Logged In Successfully',
      token,
      data: {
        data: user,
      },
    };
  }

  signToken(userId: number, email: string): Promise<String> {
    const payload = {
      id: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    return this.jwt.signAsync(payload, {
      expiresIn: '30m',
      secret,
    });
  }
}
