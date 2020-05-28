export interface PriceData {
  price: number,
  date: number
}

export interface Position {
  entry: PriceData,
  exit: PriceData,
}

export interface TradeBotData {
  currentPosition: Position | null,
  initialPortfolioValue: number,
  portfolioValue: number,
  diffs: Array<number>,
  prices: Array<PriceData>,
  positions: Array<Position>,
  buyingSpots: Array<number | null>,
  sellingSpots: Array<number | null>,
}

export enum Decision {
  HOLD = 'hodl',
  BUY = 'buy',
  SELL = 'sell',
}

export interface ChartDataset {
  label: string,
  data: Array<number>,
  borderColor?: string,
  showLine?: boolean,
  borderWidth?: number,
}
