export class UserEntity {
  id!: string;
  name!: string;
  email!: string;
  password!: string;
  roles!: string[];
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  toSafeObject(): Omit<UserEntity, 'password' | 'toSafeObject'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, toSafeObject: __, ...safe } = this;
    return safe;
  }
}
