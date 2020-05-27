require('dotenv').config()
const CoinMarketCap = require('coinmarketcap-api')
const chalk = require('chalk')

const client = new CoinMarketCap(process.env.COINMARKETCAP_API_KEY)

let availableBTC = 0.02

const prices: Array<number> = []

let boughtAt: number = 0
let diffs: Array<number> = []

const takeAction = (pricesArray: Array<number>) => {
    const amountOfData = pricesArray.length
    // we dont have enough information to take action
    if (amountOfData < 3) {
        console.log(`${timeStamp()} Not enough information (only have ${amountOfData} price(s))`)
        return
    }
    const slope = pricesArray[pricesArray.length - 1] / pricesArray[pricesArray.length - 2] - 1
    const prevSlope = pricesArray[pricesArray.length - 2] / pricesArray[pricesArray.length - 3] - 1
    if (slope >= 0 && prevSlope < 0) {
        // buy
        console.log(chalk.bgBlue.bold.white(`${timeStamp()} Buying at ${pricesArray[pricesArray.length - 1]}`))
        boughtAt = pricesArray[pricesArray.length - 1]
    } else if (slope <= 0 && prevSlope > 0 && boughtAt) {
        // sell
        console.log(chalk.bgGreen.bold.white(`${timeStamp()} Selling at ${pricesArray[pricesArray.length - 1]}`))
        diffs.push(pricesArray[pricesArray.length - 1] - boughtAt)
        boughtAt = 0
    } else {
        // No action needed
        console.log(`${timeStamp()} No action needed`)
    }
    const curBalance = diffs.reduce((acc, cur) => acc + cur, 0)
    console.log(chalk.green(`${timeStamp()} Current balance is: ${curBalance}`))
}

const tick = async () => {
    const quote = await client.getQuotes({symbol: 'BTC', convert: 'EUR'})
    const newPrice = Number(quote.data.BTC.quote.EUR.price)
    console.log(chalk.blue(`${timeStamp()} Latest price is ${newPrice}`))
    prices.push(newPrice)
    takeAction(prices)
}

tick()

setInterval(tick, 1000 * 60 * 2)

const timeStamp = (): string => {
    const now = new Date();
    const date = [ String(now.getDate()).padStart(2, '0'), String(now.getMonth() + 1).padStart(2, '0'), String(now.getFullYear()).padStart(2, '0') ];
    const time = [ String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0'), String(now.getSeconds()).padStart(2, '0') ];

    // Return the formatted string
    return "[" + date.join("/") + " " + time.join(":") + "]"
}