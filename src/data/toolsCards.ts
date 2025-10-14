// 工具页面卡片数据结构
export interface ToolCard {
  id: string
  title: string
  subtitle?: string
  content: string[]
  hasScrollButton: boolean
}

// 工具页面卡片数据
export const toolsCards: ToolCard[] = [

  {
    id: 'malaysia-carbon',
    title: 'Malaysia Carbon Data',
    subtitle: 'Malaysia per capita carbon footprint: 11.2 tons/year',
    content: [
      'In Malaysia, each person produces an average of approximately 11.2 tons of carbon dioxide emissions annually. This figure is significantly higher than the global average of 4.7 tons. Malaysia\'s per capita emissions are also relatively high compared to neighboring countries. Key factors include reliance on fossil fuel-based power generation, high car usage, and emissions from industrial activities.'
    ],
    hasScrollButton: true
  },
  {
    id: 'world-carbon',
    title: 'What is happening worldwide?',
    subtitle: 'World per capita carbon footprint: 4760kg/year',
    content: [
      'The global per capita carbon footprint is typically measured as the amount of carbon dioxide emitted per person per year. According to data from the World Bank and the Global Carbon Project, the global average per capita carbon emissions in recent years has been around 4.5-5 tons of carbon dioxide equivalent per year, but this varies significantly between countries.'
    ],
    hasScrollButton: true
  },
  {
    id: 'climate-change',
    title: 'Climate Change',
    subtitle: 'Climate change targets',
    content: [
      'To combat climate change, the Paris Agreement sets a goal of limiting global temperature rise to 1.5-2°C. To achieve this goal, the global per capita carbon footprint must fall below approximately 2 tons per year by around 2050, more than halving the current global average of 4.7 tons per year. For some high-emitting countries, this means reducing per capita carbon emissions by 70-90%.'
    ],
    hasScrollButton: true
  }
]
