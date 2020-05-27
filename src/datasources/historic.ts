import * as fs from 'fs'
import { resolve as resolvePath } from 'path'

const historicData = fs.readFileSync(resolvePath(__dirname, '../../historic-data/btcusd/btcusd1y.json'), 'utf-8')
const parsedData = JSON.parse(historicData).map(x => Number(x.open))

function* yieldPriceFromArray() {
    yield* parsedData
}

const priceList = yieldPriceFromArray()

export const getNextPrice = (): number => {
    return priceList.next().value
}
