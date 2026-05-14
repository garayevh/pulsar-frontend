import { api } from './client'
import type { ConfluencePage } from '@/types'

interface BackendPage {
  page_id: string
  title: string
  space?: string
  last_modified?: string
  url?: string
}

interface SearchResponse {
  pages: BackendPage[]
  total: number
}

export const confluenceApi = {
  search: async (query: string): Promise<ConfluencePage[]> => {
    const res = await api.get<SearchResponse>(`/confluence/search?query=${encodeURIComponent(query)}`)
    return (res.pages ?? []).map((p) => ({
      id: p.page_id,
      title: p.title,
      spaceKey: p.space ?? '',
      spaceName: p.space ?? '',
      url: p.url ?? '',
      lastModified: p.last_modified ?? '',
    }))
  },
}