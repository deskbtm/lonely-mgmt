export interface AlipayCallback {
  trade_status?: string;
  out_trade_no?: string;
  trade_no?: string;
  buyer_id?: string;
  buyer_pay_amount?: string;
}

export interface CreateQrCodeParams {
  tradeNo: string;
  price: number;
  subject: string;
  // desc: string;
  callback: string;
  // goodsName: string;
}
