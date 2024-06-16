import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../gurads/jwt.guard';

export const Auth = () => UseGuards(JwtAuthGuard);
