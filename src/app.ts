require('dotenv').config()
const chalk = require('chalk')

import { getNextPrice } from './datasources/historic'

const prices: Array<number> = []
const initialPortfolioValue = 1000
const diffs: Array<number> = []

let boughtAt: number = 0
let portfolioValue: number = initialPortfolioValue // We start with a thousand dollars

const takeAction = async () => {
    const newPrice: number = await getNextPrice()
    if (typeof newPrice === 'undefined') {
        console.log(chalk.bgRed.yellow(`${timeStamp()} Initial portfolio value: ${initialPortfolioValue}`))
        console.log(chalk.bgRed.yellow(`${timeStamp()} Final portfolio value: ${initialPortfolioValue + diffs.reduce((acc, cur) => acc + cur, 0)}`))
        console.log(chalk.bgRed.yellow(`${timeStamp()} Portfolio value change: ${((portfolioValue / initialPortfolioValue - 1) * 100).toFixed(2)}%`))
        return
    }
    prices.push(newPrice)
    console.log(chalk.blue(`${timeStamp()} Latest price is ${newPrice}`))
    const amountOfData = prices.length
    // we dont have enough information to take action
    if (amountOfData < 5) {
        console.log(`${timeStamp()} Not enough information (only have ${amountOfData} price(s))`)
        takeAction()
        return
    }
    const slope = prices[prices.length - 1] / prices[prices.length - 4] - 1
    const prevSlope = prices[prices.length - 2] / prices[prices.length - 5] - 1
    if (slope >= 0 && prevSlope < 0 && !boughtAt) {
        // buy
        console.log(chalk.bgBlue.bold.white(`${timeStamp()} Buying at ${prices[prices.length - 1]}`))
        boughtAt = prices[prices.length - 1]
    } else if (slope <= 0 && prevSlope > 0 && boughtAt) {
        // sell
        console.log(chalk.bgGreen.bold.white(`${timeStamp()} Selling at ${prices[prices.length - 1]}`))
        const relativeChange = prices[prices.length - 1] / boughtAt
        const newPortfolioValue = portfolioValue * relativeChange
        diffs.push(newPortfolioValue - portfolioValue)
        portfolioValue = newPortfolioValue
        boughtAt = 0
    } else {
        // No action needed
        console.log(`${timeStamp()} No action needed`)
    }
    const curBalance = diffs.reduce((acc, cur) => acc + cur, 0)
    console.log(chalk.green(`${timeStamp()} Current balance is: ${curBalance}`))
    console.log(chalk.green(`${timeStamp()} Current portfolio value is: ${portfolioValue}`))
    takeAction()
}


const timeStamp = (): string => {
    const now = new Date();
    const date = [ String(now.getDate()).padStart(2, '0'), String(now.getMonth() + 1).padStart(2, '0'), String(now.getFullYear()).padStart(2, '0') ];
    const time = [ String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0'), String(now.getSeconds()).padStart(2, '0') ];

    // Return the formatted string
    return "[" + date.join("/") + " " + time.join(":") + "]"
}

takeAction()
