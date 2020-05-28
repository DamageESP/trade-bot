import { resolve as resolvePath } from 'path'
import { writeFileSync } from 'fs'

import { TradeBotData, ChartDataset } from "./types"
import { timeStamp } from "./util"

const { CanvasRenderService } = require('chartjs-node-canvas')

const datasets: Array<ChartDataset> = []
const beforeRenderCallbacks = []

export const addDataset = (dataset: ChartDataset) => datasets.push(dataset)

export const beforeGraphRender = callback => beforeRenderCallbacks.push(callback)

export const renderGraph = async (data: TradeBotData) => {
  beforeRenderCallbacks.forEach(callback => callback())
  const width = 2000
  const height = 500
  const canvasRenderService = new CanvasRenderService(width, height)
  const mappedData = data.prices.map(priceData => Math.round(priceData.price))
  const mappedLabels = data.prices.map(priceData => timeStamp(priceData.date))

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
        data: data.buyingSpots,
        borderColor: '#0000FF',
        showLine: false,
        borderWidth: 10,
      },
      {
        label: 'selling points',
        data: data.sellingSpots,
        borderColor: '#00FF00',
        showLine: false,
        borderWidth: 10,
      },
      ...datasets]
    },
  }

  const image = await canvasRenderService.renderToBuffer(configuration)

  writeFileSync(resolvePath(__dirname, '../../charts/mychart.png'), image)
}