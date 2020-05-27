const CoinMarketCap = require('coinmarketcap-api')
const client = new CoinMarketCap(process.env.COINMARKETCAP_API_KEY)

const callCooldown: number = 1000 * 60 * 2
let lastCall: number = 0

export const getNextPrice = async (): Promise<number> => {
    const timeUntilNextCall: number = callCooldown - (Date.now() - lastCall)
    
    if (timeUntilNextCall <= 0) {
        lastCall = Date.now()
        const quote = await client.getQuotes({symbol: 'BTC', convert: 'EUR'})
        const newPrice = Number(quote.data.BTC.quote.EUR.price)
        return newPrice
    } else {
        const newPrice: number = await new Promise((resolve) => {
            setTimeout(async () => {
                const nextPrice = await getNextPrice()
                resolve(nextPrice)
            }, timeUntilNextCall)
        })
        return newPrice
    }
}
