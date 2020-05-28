export interface PriceData {
    price: number,
    date: number
}

export interface Position extends PriceData {
    shorted: boolean
}

export interface PortfolioData {
    positions: Array<PriceData>,
    buyingSpots: Array<number | null>,
    sellingSpots: Array<number | null>,
}

export enum AlgorithmActions {
    HOLD = 'hodl',
    BUY = 'buy',
    SELL = 'sell',
}
