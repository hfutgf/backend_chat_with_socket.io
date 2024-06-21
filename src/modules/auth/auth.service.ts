import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginDto } from './dto/auth.dto';
import { verify } from 'argon2';

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

  async login(dto: LoginDto) {
    const checkUser = await this.userService.getByEmail(dto.email);

    if (!checkUser) {
      throw new BadRequestException('User not found!');
    }

    const verifyPassword = await verify(checkUser.password, dto.password);

    if (!verifyPassword) {
      throw new BadRequestException('Incorrect password!');
    }

    const { accessToken, refreshToken } = this.issueToken(checkUser.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = checkUser;

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
      expires: expirseIn,
      secure: true,
      sameSite: 'none',
    });
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);
    if (!result) {
      throw new UnauthorizedException('Invalid refresh token!');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.userService.getById(result.id);

    const tokens = this.issueToken(user.id);
    return {
      user,
      ...tokens,
    };
  }

  removeRefreshTokenResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: process.env.DOMAIN,
      expires: new Date(0),
      secure: true,
      sameSite: 'none',
    });
  }
}
