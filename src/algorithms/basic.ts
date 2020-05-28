import { Decision, TradeBotData } from "../lib/types"

export const calculateNextMove = (botData: TradeBotData): Decision => {
  const { prices, currentPosition } = botData
  const numPrices = prices.length
  const latestPrice = prices[numPrices - 1].price
  // we dont have enough information to take action
  if (numPrices < 5) return Decision.HOLD
  const slope = latestPrice / prices[prices.length - 2].price - 1
  const prevSlope = prices[prices.length - 2].price / prices[prices.length - 3].price - 1
  if (slope >= 0 && prevSlope < 0 && !currentPosition) return Decision.BUY
  else if (slope <= 0 && prevSlope > 0 && currentPosition) return Decision.SELL
  else return Decision.HOLD
}