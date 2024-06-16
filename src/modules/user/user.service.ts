import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    try {
      const hashPassword = await hash(dto.password);

      const user = await this.prisma.user.create({
        data: { ...dto, password: hashPassword },
      });
      return user;
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }

  async getById(id: string) {
    try {
      const user = await this.prisma.user.findFirst({ where: { id } });
      if (user) {
        return user;
      }
      throw new BadGatewayException('User not found!');
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }

  async getByEmail(email: string) {
    try {
      const user = await this.prisma.user.findFirst({ where: { email } });
      if (user) {
        return user;
      }
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }
}
