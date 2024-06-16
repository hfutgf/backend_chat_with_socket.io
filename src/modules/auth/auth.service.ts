import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
  ) {}

  EXPIRE_DAY_REFRESH_TOKEN = 1;
  REFRESH_TOKEN_NAME = 'refreshToken';

  async register(dto: CreateUserDto) {
    const checkUser = await this.userService.getByEmail(dto.email);

    if (checkUser) {
      throw new BadRequestException('A user with this email exists!');
    }
    const user = await this.userService.create(dto);

    const { accessToken, refreshToken } = this.issueToken(user.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user;

    return {
      accessToken,
      refreshToken,
      ...userData,
    };
  }

  private issueToken(userId: string) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '3d',
    });
    const refreshToken = this.jwt.sign(data, {
      expiresIn: '14d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  addRefreshTokenResponse(res: Response, refreshToken: string) {
    const expirseIn = new Date();
    expirseIn.setDate(expirseIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);
    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: process.env.DOMAIN,
      expires: expirseIn,
      secure: true,
      sameSite: 'none',
    });
  }
}
