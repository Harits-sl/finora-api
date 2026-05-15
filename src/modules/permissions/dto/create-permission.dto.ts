import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z]+:[a-z]+$/, {
    message: 'name must follow the format resource:action (e.g. users:read)',
  })
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
