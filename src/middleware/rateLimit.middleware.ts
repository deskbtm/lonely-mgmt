import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
// import * as rateLimit from 'express-rate-limit';
const rateLimit = require('express-rate-limit');

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly config: ConfigService) {
    this.config = config;
  }

  use(req: Request, res: Response, next: Function) {
    rateLimit({
      windowMs: this.config.get('common.netSpeedLimitMax'),
    })(req, res, next);
  }
}
