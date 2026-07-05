"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Newspaper } from "lucide-react"

interface NewsItem {
  title: string
  source: string
  url: string
  publishedAt: string
  summary: string
  sentiment?: "positive" | "negative" | "neutral"
}

const RSS_FEEDS = [
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { name: "CoinTelegraph", url: "https://cointelegraph.com/rss" },
]

const CORS_PROXY = "https://api.allorigins.win/raw?url="

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchNews() {
      try {
        const items: NewsItem[] = []

        const res = await fetch(
          `https://newsapi.org/v2/everything?q=cryptocurrency&sortBy=publishedAt&pageSize=10&apiKey=demo`,
          { next: { revalidate: 600 } }
        )

        if (res.ok) {
          const data = await res.json()
          for (const article of data.articles ?? []) {
            items.push({
              title: article.title,
              source: article.source?.name ?? "News",
              url: article.url,
              publishedAt: article.publishedAt,
              summary: article.description ?? "",
            })
          }
        }

        if (mounted) {
          setNews(items.slice(0, 20))
          setLoading(false)
        }
      } catch {
        if (mounted) setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 300000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            News
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-center text-muted-foreground text-xs py-4">Loading news...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Newspaper className="h-4 w-4" />
          News
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {news.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-8">
              No news available
            </div>
          ) : (
            <div className="divide-y">
              {news.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2 leading-snug">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[8px] px-1 py-0">
                          {item.source}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(item.publishedAt)}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground mt-1" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
