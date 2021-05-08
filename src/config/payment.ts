import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  appId: process.env.PAYMENT_APPID,
}));
