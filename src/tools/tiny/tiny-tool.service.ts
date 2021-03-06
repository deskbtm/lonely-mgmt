/*
 *   Copyright (c) 2021
 *   All rights reserved.
 */
import * as os from 'os';
import { resolve } from 'path';
import * as dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import mysqldump from 'mysqldump';
import { Injectable } from '@nestjs/common';
import { mkdirpSync, pathExistsSync } from 'fs-extra';
const pkg = require('../../../package.json');
const ormconfig = require('../../../ormconfig');
const ENV = process.env.NODE_ENV;
const savePath = resolve(os.homedir(), `.mysql-bak/${pkg.name}`);

if (!pathExistsSync(savePath)) {
  mkdirpSync(savePath);
}

@Injectable()
export class TinyToolService {
  constructor() {}

  public async bakDb() {
    if (ENV !== 'production') {
      return false;
    }

    return mysqldump({
      connection: {
        host: ormconfig.host,
        user: ormconfig.username,
        password: ormconfig.password,
        database: ormconfig.database,
      },
      dumpToFile: resolve(
        savePath,
        `${dayjs().format('YYYY-MM-DD_HH:mm:ss')}-${nanoid(8)}.sql.gz`,
      ),
      compressFile: true,
    });
  }
}
