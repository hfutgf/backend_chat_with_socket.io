import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
    });

    if (user) {
      return new BadRequestException('A user with this number exists!');
    }

    try {
      const user = await this.prisma.user.create({
        data: { ...dto, name: 'user' + (Math.random() * 10000).toFixed() },
      });
      return user;
    } catch (error) {
      const e = error as Error;
      return new BadRequestException(e.message);
    }
  }
}
