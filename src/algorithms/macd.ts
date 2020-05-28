import { Decision, TradeBotData, PriceData } from "../lib/types"
import { beforeGraphRender, addDataset } from "../lib/chart"
import { calculateNextMove as calculateNextBasicMove } from "./basic"
const v8 = require('v8')

const emas12: Array<number> = []
const emas26: Array<number> = []

beforeGraphRender(() => {
  addDataset({
    data: emas12,
    label: 'EMAS12',
    borderColor: '#FFFF00',
  })
  addDataset({
    data: emas26,
    label: 'EMAS26',
    borderColor: '#00FFFF',
  })
})

export const calculateNextMove = (botData: TradeBotData): Decision => {
  const { prices } = botData
  // Source: https://www.investopedia.com/ask/answers/122314/what-exponential-moving-average-ema-formula-and-how-ema-calculated.asp
  const numPrices = prices.length
  const getEMA = (prices: Array<PriceData>, days: number): number => {
    const workingSet = prices.slice(prices.length - days - 1)
    if (numPrices < days) return null
    const weightedMultiplier = 2 / (days + 1)
    const priceToday = workingSet[workingSet.length - 1]?.price
    let ema: number
    if (numPrices === days) {
      const simpleAverage = prices.reduce((result, priceData) => result += priceData.price / days, 0)
      ema = priceToday * weightedMultiplier + simpleAverage * (1 - weightedMultiplier)
    } else ema = priceToday * weightedMultiplier + emas12[emas12.length - 1] * (1 - weightedMultiplier)

    return ema
  }
  const ema12 = getEMA(prices, 12)
  const ema26 = getEMA(prices, 26)
  emas12.push(ema12)
  emas26.push(ema26)
  const clone = v8.deserialize(v8.serialize(botData));
  clone.prices = clone.prices.map((priceData, i): PriceData => {
    return {
      date: priceData.date,
      price: emas12[i],
    }
  })

  console.log(clone);
  

  return calculateNextBasicMove(clone)
}