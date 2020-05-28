require('dotenv').config()
const chalk = require('chalk')

import { getNextPrice } from './datasources/historic'
import { timeStamp } from './lib/util'
import { PriceData, TradeBotData, Decision } from './lib/types'
import { calculateNextMove } from './algorithms/macd'
import { renderGraph } from './lib/chart'

const botData: TradeBotData = {
  currentPosition: null,
  buyingSpots: [],
  sellingSpots: [],
  diffs: [],
  initialPortfolioValue: 1000,
  positions: [],
  prices: [],
  portfolioValue: 1000
}

const takeAction = async () => {
  const newPrice: PriceData = await getNextPrice()
  if (typeof newPrice === 'undefined') {
    console.log(chalk.bgRed.yellow(`${timeStamp()} Initial portfolio value: ${botData.initialPortfolioValue}`))
    console.log(chalk.bgRed.yellow(`${timeStamp()} Final portfolio value: ${botData.initialPortfolioValue + botData.diffs.reduce((acc, cur) => acc + cur, 0)}`))
    console.log(chalk.bgRed.yellow(`${timeStamp()} Portfolio value change: ${((botData.portfolioValue / botData.initialPortfolioValue - 1) * 100).toFixed(2)}%`))
    await renderGraph(botData)
    return
  }    
  botData.prices.push(newPrice)
  console.log(chalk.blue(`${timeStamp()} Latest price is ${newPrice.price}`))
  const amountOfData = botData.prices.length
  // we dont have enough information to take action
  if (amountOfData < 5) {
    console.log(`${timeStamp()} Not enough information (only have ${amountOfData} price(s))`)
    botData.buyingSpots.push(null)
    botData.sellingSpots.push(null)
    takeAction()
    return
  }
  const decision: Decision = calculateNextMove(botData)
  if (decision === Decision.BUY) {
    // buy
    botData.currentPosition = {
      entry: newPrice,
      exit: null
    }
    console.log(chalk.bgBlue.bold.white(`${timeStamp()} Buying at ${newPrice.price}`))
    botData.buyingSpots.push(Math.round(botData.prices[amountOfData - 1].price))
    botData.sellingSpots.push(null)
  } else if (decision === Decision.SELL) {
    // sell
    botData.currentPosition.exit = newPrice
    botData.positions.push(botData.currentPosition)
    console.log(chalk.bgGreen.bold.white(`${timeStamp()} Selling at ${newPrice.price}`))
    const relativeChange = newPrice.price / botData.currentPosition.entry.price
    const newPortfolioValue = botData.portfolioValue * relativeChange
    botData.diffs.push(newPortfolioValue - botData.portfolioValue)
    botData.portfolioValue = newPortfolioValue
    botData.currentPosition = null
    botData.sellingSpots.push(Math.round(newPrice.price))
    botData.buyingSpots.push(null)
    botData.currentPosition = null
  } else {
    // No action needed
    botData.buyingSpots.push(null)
    botData.sellingSpots.push(null)
    console.log(`${timeStamp()} No action needed`)
  }
  const curBalance = botData.diffs.reduce((acc, cur) => acc + cur, 0)
  console.log(chalk.green(`${timeStamp()} Current balance is: ${curBalance}`))
  console.log(chalk.green(`${timeStamp()} Current portfolio value is: ${botData.portfolioValue}`))
  takeAction()
}

takeAction()
