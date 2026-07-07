"use client"

import { useAlertChecker } from "@/hooks/useAlertChecker"
import { CryptoHeatmap } from "@/components/screeners/Heatmap"
import { GainersLosers } from "@/components/screeners/GainersLosers"
import { TechnicalScreener } from "@/components/screeners/TechnicalScreener"
import { NewsFeed } from "@/components/screeners/NewsFeed"
import { SentimentDashboard } from "@/components/screeners/SentimentDashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, TrendingUp, Search, Newspaper, MessageCircle } from "lucide-react"

export default function ScreenersPage() {
  useAlertChecker()

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <Tabs defaultValue="heatmap">
        <TabsList>
          <TabsTrigger value="heatmap" className="text-xs gap-1">
            <LayoutGrid className="h-3.5 w-3.5" />
            Heatmap
          </TabsTrigger>
          <TabsTrigger value="gainers" className="text-xs gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Movers
          </TabsTrigger>
          <TabsTrigger value="screener" className="text-xs gap-1">
            <Search className="h-3.5 w-3.5" />
            Screener
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="text-xs gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="news" className="text-xs gap-1">
            <Newspaper className="h-3.5 w-3.5" />
            News
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="mt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Crypto Market Heatmap</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CryptoHeatmap />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gainers" className="mt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Top Movers</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <GainersLosers />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screener" className="mt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Technical Screener</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <TechnicalScreener />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="mt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <SentimentDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="mt-4">
          <NewsFeed />
        </TabsContent>
      </Tabs>
    </div>
  )
}
