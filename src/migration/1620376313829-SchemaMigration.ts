import {MigrationInterface, QueryRunner} from "typeorm";

export class SchemaMigration1620376313829 implements MigrationInterface {
    name = 'SchemaMigration1620376313829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `app-update` (`id` varchar(36) NOT NULL, `release_timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `title` varchar(255) NOT NULL, `description` text NOT NULL, `description_html` text NOT NULL, `semver` varchar(255) NOT NULL, `force_update` tinyint NOT NULL DEFAULT 0, `goodsId` varchar(36) NULL, `releaseById` varchar(36) NULL, UNIQUE INDEX `IDX_ee166a24c001b63f681348f84f` (`semver`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `admin` (`id` varchar(36) NOT NULL, `username` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `bilibili_cookie` text NULL DEFAULT NULL, `bilibili_uid` varchar(255) NULL DEFAULT NULL, `create_time` timestamp(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `update_time` timestamp(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_5e568e001f9d1b91f67815c580` (`username`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `splash-notification` (`id` varchar(36) NOT NULL, `timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `title` varchar(255) NOT NULL, `description` text NOT NULL, `description_html` text NOT NULL, `force_display` tinyint NOT NULL COMMENT '否强制展示', `display` tinyint NOT NULL COMMENT '是否展示', `buttons` json NULL DEFAULT NULL, `goodsId` varchar(36) NULL, `releaseById` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `goods` (`id` varchar(36) NOT NULL, `goods_name` varchar(32) NOT NULL, `package_name` varchar(64) NOT NULL, `price` double NOT NULL, `discount` double NOT NULL DEFAULT '0', `disabled` tinyint NOT NULL DEFAULT 0, `shareUrl` varchar(255) NULL DEFAULT NULL, `alipay_callback` varchar(255) NOT NULL, `alipay_gateway` varchar(255) NOT NULL, `alipay_desc` text NOT NULL, `accomplishShareTask` tinyint NOT NULL DEFAULT 0, `createById` varchar(36) NULL, `userId` varchar(36) NULL, UNIQUE INDEX `IDX_ef142740e862f2867e67252385` (`goods_name`), UNIQUE INDEX `IDX_9388dafcf2830d042790226b45` (`package_name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `payment` (`id` varchar(36) NOT NULL, `pay_timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `trade_no` varchar(64) NULL, `alipay_trade_no` varchar(64) NULL, `buyer_alipay_id` varchar(64) NULL, `purchased` tinyint NOT NULL DEFAULT 0, `pay_amount` double NULL, `discount` double NOT NULL DEFAULT '0', `json` json NULL, `goodsId` varchar(36) NULL, `userId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`id` varchar(36) NOT NULL, `username` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `forbidden` tinyint NOT NULL COMMENT '用户状态' DEFAULT 0, `followedBilibili` tinyint NOT NULL DEFAULT 0, `bilibiliUid` varchar(255) NULL DEFAULT NULL, `create_time` timestamp(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `update_time` timestamp(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `device_id` varchar(36) NULL, UNIQUE INDEX `IDX_78a916df40e02a9deb1c4b75ed` (`username`), UNIQUE INDEX `REL_0232591a0b48e1eb92f3ec5d0d` (`device_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `device` (`id` varchar(36) NOT NULL, `uniqueId` varchar(255) NULL, `os` varchar(255) NULL, `osVersion` varchar(255) NULL, `brand` varchar(255) NULL, `totalMemory` bigint NULL, `modelName` varchar(255) NULL, `create_time` timestamp(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `update_time` timestamp(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `permission` (`id` varchar(36) NOT NULL, `pid` int NOT NULL, `code` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `create_time` timestamp(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `update_time` timestamp(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `role` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `desc` varchar(255) NULL, `create_time` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `update_time` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `app-update` ADD CONSTRAINT `FK_bda9c6494a89469ab25242f69a5` FOREIGN KEY (`goodsId`) REFERENCES `goods`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `app-update` ADD CONSTRAINT `FK_6e38fc4bbfe81a461411a5357bc` FOREIGN KEY (`releaseById`) REFERENCES `admin`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `splash-notification` ADD CONSTRAINT `FK_a24c0da8059f7e42b69e3c3328b` FOREIGN KEY (`goodsId`) REFERENCES `goods`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `splash-notification` ADD CONSTRAINT `FK_c32861a900e195744175e3df00b` FOREIGN KEY (`releaseById`) REFERENCES `admin`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `goods` ADD CONSTRAINT `FK_9828dd3e172d7a749ffd9133eb3` FOREIGN KEY (`createById`) REFERENCES `admin`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `goods` ADD CONSTRAINT `FK_61650a11a4d5ebfd2a6195cd1d1` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `payment` ADD CONSTRAINT `FK_705f66c7b740c15b8418ac557d0` FOREIGN KEY (`goodsId`) REFERENCES `goods`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `payment` ADD CONSTRAINT `FK_b046318e0b341a7f72110b75857` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_0232591a0b48e1eb92f3ec5d0d1` FOREIGN KEY (`device_id`) REFERENCES `device`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_0232591a0b48e1eb92f3ec5d0d1`");
        await queryRunner.query("ALTER TABLE `payment` DROP FOREIGN KEY `FK_b046318e0b341a7f72110b75857`");
        await queryRunner.query("ALTER TABLE `payment` DROP FOREIGN KEY `FK_705f66c7b740c15b8418ac557d0`");
        await queryRunner.query("ALTER TABLE `goods` DROP FOREIGN KEY `FK_61650a11a4d5ebfd2a6195cd1d1`");
        await queryRunner.query("ALTER TABLE `goods` DROP FOREIGN KEY `FK_9828dd3e172d7a749ffd9133eb3`");
        await queryRunner.query("ALTER TABLE `splash-notification` DROP FOREIGN KEY `FK_c32861a900e195744175e3df00b`");
        await queryRunner.query("ALTER TABLE `splash-notification` DROP FOREIGN KEY `FK_a24c0da8059f7e42b69e3c3328b`");
        await queryRunner.query("ALTER TABLE `app-update` DROP FOREIGN KEY `FK_6e38fc4bbfe81a461411a5357bc`");
        await queryRunner.query("ALTER TABLE `app-update` DROP FOREIGN KEY `FK_bda9c6494a89469ab25242f69a5`");
        await queryRunner.query("DROP TABLE `role`");
        await queryRunner.query("DROP TABLE `permission`");
        await queryRunner.query("DROP TABLE `device`");
        await queryRunner.query("DROP INDEX `REL_0232591a0b48e1eb92f3ec5d0d` ON `user`");
        await queryRunner.query("DROP INDEX `IDX_78a916df40e02a9deb1c4b75ed` ON `user`");
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP TABLE `payment`");
        await queryRunner.query("DROP INDEX `IDX_9388dafcf2830d042790226b45` ON `goods`");
        await queryRunner.query("DROP INDEX `IDX_ef142740e862f2867e67252385` ON `goods`");
        await queryRunner.query("DROP TABLE `goods`");
        await queryRunner.query("DROP TABLE `splash-notification`");
        await queryRunner.query("DROP INDEX `IDX_5e568e001f9d1b91f67815c580` ON `admin`");
        await queryRunner.query("DROP TABLE `admin`");
        await queryRunner.query("DROP INDEX `IDX_ee166a24c001b63f681348f84f` ON `app-update`");
        await queryRunner.query("DROP TABLE `app-update`");
    }

}
