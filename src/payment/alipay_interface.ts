'use strict';

import { createSign } from 'crypto';

var fs = require('fs');
var request = require('request');
var qs = require('querystring');

var private_key;
var baseUrl = 'https://openapi.alipay.com/gateway.do';
var api_method = {
  pay: 'alipay.trade.pay',
  h5Pay: 'alipay.trade.wap.pay',
  precreate: 'alipay.trade.precreate',
  appPay: 'alipay.trade.app.pay',
  query: 'alipay.trade.query',
  cancel: 'alipay.trade.cancel',
  refund: 'alipay.trade.refund',
};
var app_id;

function sortKey(info) {
  var str = '';
  var keyArr = [];
  for (var key in info) {
    if (info[key] == '' || !info[key]) {
      continue;
    }
    keyArr.push(key);
  }
  keyArr.sort();
  for (var i = 0; i < keyArr.length; i++) {
    if (i > 0) {
      str += '&';
    }
    str += keyArr[i] + '=' + info[keyArr[i]];
  }
  // console.log("params:" + str);
  return str;
}

//签名
function veriySign(params) {
  try {
    //读取秘钥
    var privatePem = private_key;
    var key =
      typeof privatePem == 'string' ? privatePem : privatePem.toString();
    var sortedString = sortKey(params);
    var sign = createSign('RSA-SHA256');
    sign.update(sortedString);
    return encodeURIComponent(sign.sign(key, 'base64'));
  } catch (err) {
    console.log('err', err);
  }
}

//获取请求所需的时间戳字符串
function getTimestampStr() {
  var now = new Date();
  var year = now.getFullYear(),
    month = now.getMonth() + 1,
    date = now.getDate(),
    hours = now.getHours(),
    mins = now.getMinutes(),
    seconds = now.getSeconds();
  //初始化date,month,hours,mins,seconds位数
  month = (month > 9 ? month : '0' + month) as any;
  date = (date > 9 ? date : '0' + date) as any;
  hours = (hours > 9 ? hours : '0' + hours) as any;
  mins = (mins > 9 ? mins : '0' + mins) as any;
  seconds = (seconds > 9 ? seconds : '0' + seconds) as any;
  return (
    year + '-' + month + '-' + date + ' ' + hours + ':' + mins + ':' + seconds
  );
}

/**
 * 发起条码支付
 * @param  {[String]} biz_content [请求参数的集合]
 * @param {[String]} notify_url [通知地址]
 * @param {[String]} app_auth_token [应用授权]
 * biz_content常用参数,其它参数详见支付宝文档
 * biz_content:{
		"out_trade_no",//商户订单号,64个字符以内、可包含字母、数字、下划线；需保证在商户端不重复
		"scene ",//条码支付，取值：bar_code 声波支付，取值：wave_code
		"subject"//	订单标题
		"auth_code"//支付授权码，25~30开头的长度为16~24位的数字，实际字符串长度以开发者获取的付款码长度为准
		"total_amount"//订单总金额，单位为元，精确到小数点后两位
	}
 */
var pay = function (params) {
  var url = baseUrl;
  var body = {
    app_id: app_id,
    method: api_method.pay,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: getTimestampStr(),
    version: '1.0',
    biz_content: params.biz_content,
  } as any;

  if (params.notify_url) {
    body.notify_url = params.notify_url;
  }
  if (params.app_auth_token) {
    body.app_auth_token = params.app_auth_token;
  }

  body.biz_content = JSON.stringify(body.biz_content);

  //对路由编码，主要对中文编码，不然验签会失败
  url = url + '?' + qs.stringify(body);

  body.sign = veriySign(body);

  //拼接签名
  url = url + '&sign=' + body.sign;

  return new Promise(function (resolve, reject) {
    request.post({ url: url, json: true }, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      resolve(body);
    });
  });
};

/**
 * 手机网站h5支付
 * @author penguinhj
 * @DateTime 2019-09-03T10:12:39+0800
 * @param  {[String]} biz_content [请求参数的集合]
 * @param {[String]} return_url [支付成功后跳转地址]
 * @param {[String]} notify_url [通知地址]
 * @param {[String]} app_auth_token [应用授权]
 * biz_content常用参数,其它参数详见支付宝文档
 * biz_content:{
		"out_trade_no",//商户订单号,64个字符以内、可包含字母、数字、下划线；需保证在商户端不重复
		"subject"//	订单标题
		"total_amount"//订单总金额，单位为元，精确到小数点后两位
	}
 */
var payH5 = function (params) {
  var url = baseUrl;
  var body = {
    app_id: app_id,
    method: api_method.h5Pay,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: getTimestampStr(),
    version: '1.0',
    biz_content: params.biz_content,
  } as any;

  if (params.return_url) {
    body.return_url = params.return_url;
  }
  if (params.notify_url) {
    body.notify_url = params.notify_url;
  }
  if (params.app_auth_token) {
    body.app_auth_token = params.app_auth_token;
  }

  body.biz_content.product_code = 'QUICK_WAP_WAY';

  body.biz_content = JSON.stringify(body.biz_content);

  //对路由编码，主要对中文编码，不然验签会失败
  url = url + '?' + qs.stringify(body);

  body.sign = veriySign(body);

  //拼接签名
  url = url + '&sign=' + body.sign;

  return new Promise(function (resolve, reject) {
    resolve(url);
  });
};

/**
 * 统一收单线下交易预创建
 * @param  {Object} biz_content [请求参数的集合]
 * @param {[String]} notify_url [通知地址]
 * @param  {[String]} app_auth_token [应用授权地址]
 * biz_content常用参数,其它参数详见支付宝文档
 * biz_content:{
		"out_trade_no",//商户订单号,64个字符以内、可包含字母、数字、下划线；需保证在商户端不重复
		"subject"//	订单标题
		"total_amount"//订单总金额，单位为元，精确到小数点后两位
	}
 */
var precreate = function (params) {
  var url = baseUrl;
  var body = {
    app_id: app_id,
    method: api_method.precreate,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: getTimestampStr(),
    version: '1.0',
    biz_content: params.biz_content,
  } as any;

  if (params.notify_url) {
    body.notify_url = params.notify_url;
  }
  if (params.app_auth_token) {
    body.app_auth_token = params.app_auth_token;
  }

  body.biz_content = JSON.stringify(body.biz_content);

  //对路由编码，主要对中文编码，不然验签会失败
  url = url + '?' + qs.stringify(body);

  // console.log(veriySign(body));
  body.sign = veriySign(body);

  //拼接签名
  url = url + '&sign=' + body.sign;

  return new Promise(function (resolve, reject) {
    request.post({ url: url, json: true }, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      resolve(body);
    });
  });
};

/**
 * app支付接口
 * @author penguinhj
 * @DateTime 2019-09-03T10:12:39+0800
 * @param  {[String]} biz_content [请求参数的集合]
 * @param {[String]} return_url [支付成功后跳转地址]
 * @param {[String]} notify_url [通知地址]
 * @param {[String]} app_auth_token [应用授权]
 * biz_content常用参数,其它参数详见支付宝文档
 * biz_content:{
		"out_trade_no",//商户订单号,64个字符以内、可包含字母、数字、下划线；需保证在商户端不重复
		"subject"//	订单标题
		"total_amount"//订单总金额，单位为元，精确到小数点后两位
	}
 */
var appPay = function (params) {
  var url = baseUrl;
  var body = {
    app_id: params.app_id,
    method: api_method.appPay,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: getTimestampStr(),
    version: '1.0',
    biz_content: params.biz_content,
  } as any;

  if (params.return_url) {
    body.return_url = params.return_url;
  }
  if (params.notify_url) {
    body.notify_url = params.notify_url;
  }
  if (params.app_auth_token) {
    body.app_auth_token = params.app_auth_token;
  }

  body.biz_content = JSON.stringify(body.biz_content);

  //对路由编码，主要对中文编码，不然验签会失败
  url = url + '?' + qs.stringify(body);

  body.sign = veriySign(body);

  //拼接签名
  url = url + '&sign=' + body.sign;

  return new Promise(function (resolve, reject) {
    resolve(url);
  });
};

/**
 * 统一收单线下交易查询
 * @param  {[String]} biz_content [请求参数的集合]
 * @param {[String]} app_auth_token [应用授权]
 * biz_content常用参数,其它参数详见支付宝文档
 * biz_content:{
		"out_trade_no",//订单支付时传入的商户订单号,和支付宝交易号不能同时为空。 trade_no,out_trade_no如果同时存在优先取trade_no
		"trade_no"//支付宝交易号，和商户订单号不能同时为空
	}
 */
var query = function (params) {
  var url = baseUrl;
  var body = {
    app_id: app_id,
    method: api_method.query,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: getTimestampStr(),
    version: '1.0',
    biz_content: params.biz_content,
  } as any;
  if (params.app_auth_token) {
    body.app_auth_token = params.app_auth_token;
  }

  body.biz_content = JSON.stringify(body.biz_content);

  //对路由编码，主要对中文编码，不然验签会失败
  url = url + '?' + qs.stringify(body);

  body.sign = veriySign(body);

  //拼接签名
  url = url + '&sign=' + body.sign;

  return new Promise(function (resolve, reject) {
    request.post({ url: url, json: true }, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      resolve(body);
    });
  });
};

/**
 * 统一收单交易撤销接口
 * @param  {[String]} biz_content [请求参数的集合]
 * @param {[String]} app_auth_token [应用授权]
 * biz_content常用参数,其它参数详见支付宝文档
 * biz_content:{
		"out_trade_no",//订单支付时传入的商户订单号,和支付宝交易号不能同时为空。 trade_no,out_trade_no如果同时存在优先取trade_no
		"trade_no"//支付宝交易号，和商户订单号不能同时为空
	}
 */
var cancel = function (params) {
  var url = baseUrl;
  var body = {
    app_id: app_id,
    method: api_method.cancel,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: getTimestampStr(),
    version: '1.0',
    biz_content: params.biz_content,
  } as any;

  if (params.app_auth_token) {
    body.app_auth_token = params.app_auth_token;
  }

  body.biz_content = JSON.stringify(body.biz_content);

  //对路由编码，主要对中文编码，不然验签会失败
  url = url + '?' + qs.stringify(body);

  // console.log(veriySign(body));
  body.sign = veriySign(body);

  //拼接签名
  url = url + '&sign=' + body.sign;

  return new Promise(function (resolve, reject) {
    request.post({ url: url, json: true }, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      resolve(body);
    });
  });
};

/**
 * 统一收单交易退款接口
 * @param  {[String]} biz_content [请求参数的集合]
 * @param  {[String]} app_auth_token [应用授权地址]
 * biz_content常用参数,其它参数详见支付宝文档
 * biz_content:{
		"out_trade_no",//订单支付时传入的商户订单号,和支付宝交易号不能同时为空。 trade_no,out_trade_no如果同时存在优先取trade_no
		"trade_no"//支付宝交易号，和商户订单号不能同时为空
		"refund_amount"//需要退款的金额，该金额不能大于订单金额,单位为元，支持两位小数
	}
 */
var refund = function (params) {
  var url = baseUrl;
  var body = {
    app_id: app_id,
    method: api_method.refund,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: getTimestampStr(),
    version: '1.0',
    biz_content: params.biz_content,
  } as any;

  if (params.app_auth_token) {
    body.app_auth_token = params.app_auth_token;
  }

  body.biz_content = JSON.stringify(body.biz_content);

  //对路由编码，主要对中文编码，不然验签会失败
  url = url + '?' + qs.stringify(body);

  // console.log(veriySign(body));
  body.sign = veriySign(body);

  //拼接签名
  url = url + '&sign=' + body.sign;

  return new Promise(function (resolve, reject) {
    request.post({ url: url, json: true }, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      resolve(body);
    });
  });
};

var qrPay = function (params) {
  var url = baseUrl;
  var body = {
    app_id: app_id,
    method: api_method.refund,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: getTimestampStr(),
    version: '1.0',
    biz_content: params.biz_content,
  } as any;

  if (params.app_auth_token) {
    body.app_auth_token = params.app_auth_token;
  }

  body.biz_content = JSON.stringify(body.biz_content);

  //对路由编码，主要对中文编码，不然验签会失败
  url = url + '?' + qs.stringify(body);

  // console.log(veriySign(body));
  body.sign = veriySign(body);

  //拼接签名
  url = url + '&sign=' + body.sign;

  return new Promise(function (resolve, reject) {
    request.post({ url: url, json: true }, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      resolve(body);
    });
  });
};

// exports.alipay_pay = pay;//发起条码支付
// exports.alipay_query = query;//统一收单线下交易查询
// exports.alipay_cancel = cancel;//统一收单交易撤销接口

/**
 * 初始化阿里支付客户端
 * @param  {[file]} private_key [加密私钥文件]
 * @param {[app_id]} app_id [应用id]
 */

export const initClient = function (params) {
  if (!params) {
    console.log("can't found params. 缺少初始化参数");
    return;
  }
  if (!params.private_key) {
    console.log("can't found private_key. 缺少加密私钥文件");
    return;
  }
  if (!params.app_id) {
    console.log("can't found app_id. 缺少应用id");
    return;
  }
  var isPemFile = /.*\.pem$/;
  try {
    private_key = isPemFile.test(params.private_key)
      ? fs.readFileSync(params.private_key)
      : params.private_key;
  } catch (err) {
    console.log(err);
    return;
  }
  app_id = params.app_id;
  return {
    pay: pay,
    payH5: payH5,
    precreate: precreate,
    appPay: appPay,
    query: query,
    cancel: cancel,
    refund: refund,
  };
};
