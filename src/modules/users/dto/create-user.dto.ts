import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/constants';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100)
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
