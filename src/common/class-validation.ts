import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { is } from './utils';

export function IsDevice(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsDevice',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (
            value &&
            is.string(value.os) &&
            is.string(value.osVersion) &&
            is.string(value.modelName) &&
            is.string(value.brand)
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
    });
  };
}

export function IsGoodsNameOrPackageName(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsGoodsNameOrPackageName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args) {
          const target = args.object as any;
          if (target && Object.keys(target).length > 0) {
            return !!target.goodsName || !!target.packageName;
          } else {
            return false;
          }
        },
      },
    });
  };
}
