import { api } from './client'

export interface FigmaFrame {
  id: string
  name: string
  type: string
  page?: string
}

interface FigmaFramesResponse {
  frames: FigmaFrame[]
  total: number
}

export const figmaApi = {
  getFrames: async (url: string): Promise<FigmaFrame[]> => {
    const res = await api.get<FigmaFramesResponse>(
      `/figma/frames?url=${encodeURIComponent(url)}`
    )
    return res.frames ?? []
  },
}