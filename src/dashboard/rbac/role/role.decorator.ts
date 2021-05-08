import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export enum PERMISSION {
  SUPER_ADMIN = 0,
  ADMIN = 1,
  CUSTOMER = 2,
}
