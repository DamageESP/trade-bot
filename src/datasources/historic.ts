import * as fs from 'fs'
import { resolve as resolvePath } from 'path'
import { PriceData } from '../lib/types'

const historicData = fs.readFileSync(resolvePath(__dirname, '../../historic-data/btcusd/btcusd30d.json'), 'utf-8')
const parsedData = JSON.parse(historicData).map(x => {
  return {
    price: Number(x.close),
    date: Number(x.date) * 1000,
  }
})

function* yieldPriceFromArray() {
  yield* parsedData
}

const priceList = yieldPriceFromArray()

export const getNextPrice = (): PriceData => {
  return priceList.next().value
}
