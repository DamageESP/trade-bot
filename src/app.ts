require('dotenv').config()
const chalk = require('chalk')
import * as fs from 'fs'
import { resolve as resolvePath } from 'path'

import { getNextPrice } from './datasources/historic'
import { timeStamp } from './lib/util'
import { PriceData } from './lib/types'

const prices: Array<PriceData> = []
const initialPortfolioValue = 1000
const diffs: Array<number> = []
const buyingSpots: Array<number|null> = []
const sellingSpots: Array<number|null> = []

let boughtAt: number = 0
let portfolioValue: number = initialPortfolioValue // We start with a thousand dollars

const takeAction = async () => {
    const newPrice: PriceData = await getNextPrice()
    if (typeof newPrice === 'undefined') {
        console.log(chalk.bgRed.yellow(`${timeStamp()} Initial portfolio value: ${initialPortfolioValue}`))
        console.log(chalk.bgRed.yellow(`${timeStamp()} Final portfolio value: ${initialPortfolioValue + diffs.reduce((acc, cur) => acc + cur, 0)}`))
        console.log(chalk.bgRed.yellow(`${timeStamp()} Portfolio value change: ${((portfolioValue / initialPortfolioValue - 1) * 100).toFixed(2)}%`))
        await renderGraph(prices)
        return
    }    
    prices.push(newPrice)
    console.log(chalk.blue(`${timeStamp()} Latest price is ${newPrice.price}`))
    const amountOfData = prices.length
    // we dont have enough information to take action
    if (amountOfData < 5) {
        console.log(`${timeStamp()} Not enough information (only have ${amountOfData} price(s))`)
        buyingSpots.push(null)
        sellingSpots.push(null)
        takeAction()
        return
    }
    const slope = prices[prices.length - 1].price / prices[prices.length - 2].price - 1
    const prevSlope = prices[prices.length - 2].price / prices[prices.length - 3].price - 1
    if (slope >= 0 && prevSlope < 0 && !boughtAt) {
        // buy
        console.log(chalk.bgBlue.bold.white(`${timeStamp()} Buying at ${prices[prices.length - 1].price}`))
        boughtAt = prices[prices.length - 1].price
        buyingSpots.push(Math.round(prices[prices.length - 1].price))
        sellingSpots.push(null)
    } else if (slope <= 0 && prevSlope > 0 && boughtAt) {
        // sell
        console.log(chalk.bgGreen.bold.white(`${timeStamp()} Selling at ${prices[prices.length - 1].price}`))
        const relativeChange = prices[prices.length - 1].price / boughtAt
        const newPortfolioValue = portfolioValue * relativeChange
        diffs.push(newPortfolioValue - portfolioValue)
        portfolioValue = newPortfolioValue
        boughtAt = 0
        sellingSpots.push(Math.round(prices[prices.length - 1].price))
        buyingSpots.push(null)
    } else {
        // No action needed
        buyingSpots.push(null)
        sellingSpots.push(null)
        console.log(`${timeStamp()} No action needed`)
    }
    const curBalance = diffs.reduce((acc, cur) => acc + cur, 0)
    console.log(chalk.green(`${timeStamp()} Current balance is: ${curBalance}`))
    console.log(chalk.green(`${timeStamp()} Current portfolio value is: ${portfolioValue}`))
    takeAction()
}

takeAction()

const { CanvasRenderService } = require('chartjs-node-canvas');

const width = 1500;
const height = 500;
const canvasRenderService = new CanvasRenderService(width, height);

const renderGraph = async (data: Array<PriceData>) => {
    const mappedData = data.map(priceData => Math.round(priceData.price))
    const mappedLabels = data.map(priceData => timeStamp(priceData.date))
    
    const configuration = {
        type: 'line',
        data: {
            labels: mappedLabels,
            datasets: [{
                label: 'BTCUSD',
                data: mappedData,
                borderColor: '#FF0000'
            },
            {
                label: 'buying points',
                data: buyingSpots,
                borderColor: '#0000FF',
                showLine: false,
                borderWidth: 10,
            },
            {
                label: 'selling points',
                data: sellingSpots,
                borderColor: '#00FF00',
                showLine: false,
                borderWidth: 10,
            }]
        },
    }

    const image = await canvasRenderService.renderToBuffer(configuration)

    fs.writeFileSync(resolvePath(__dirname, '../charts/mychart.png'), image)
}
