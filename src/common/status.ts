export enum StatusCode {
  TIMEOUT = -1,
  ERROR = 0,
  SUCCESS = 1,
}

export const TradeStatus = {
  CLOSED: 'TRADE_CLOSED',
  FINISHED: 'TRADE_FINISHED',
  SUCCESS: 'TRADE_SUCCESS',
  WAITING: 'WAIT_BUYER_PAY',
};

export const QueryTradeCode = {
  NOT_EXIST: 'ACQ.TRADE_NOT_EXIST',
};
