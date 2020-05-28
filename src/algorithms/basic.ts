import { PriceData, AlgorithmActions } from "../lib/types"
import { timeStamp } from "../lib/util"
import chalk = require('chalk')

export const calculateNextMove = (prices: Array<PriceData>): AlgorithmActions => {
    const numPrices = prices.length
    const latestPrice = prices[numPrices - 1].price
    console.log(chalk.blue(`${timeStamp()} Latest price is ${latestPrice}`))
    const amountOfData = prices.length
    // we dont have enough information to take action
    if (amountOfData < 5) {
        return AlgorithmActions.HOLD
    }
    const slope = latestPrice / prices[prices.length - 2].price - 1
    const prevSlope = prices[prices.length - 2].price / prices[prices.length - 3].price - 1
    if (slope >= 0 && prevSlope < 0 && !boughtAt) {
        // buy
        return AlgorithmActions.BUY
    } else if (slope <= 0 && prevSlope > 0 && boughtAt) {
        // sell
        return AlgorithmActions.SELL
    } else {
        // No action needed
        return AlgorithmActions.HOLD
    }
}