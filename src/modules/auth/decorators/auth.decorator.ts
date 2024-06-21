import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../gurads/jwt-auth.guard';

export const Auth = () => UseGuards(JwtAuthGuard);
