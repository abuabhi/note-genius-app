
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useHelpAnalyticsMetrics } from '@/hooks/help/useHelpAnalyticsQueries';
import { HelpCircle, Video, Search, Clock, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export const HelpAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  
  const { data: metrics, isLoading } = useHelpAnalyticsMetrics(dateRange);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Help Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Help Analytics</h2>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{metrics?.totalViews || 0}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-mint-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold">
                  {metrics?.averageSessionDuration 
                    ? `${Math.round(metrics.averageSessionDuration / 60)}m`
                    : '0m'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Video Completion</p>
                <p className="text-2xl font-bold">
                  {metrics?.videoCompletionRate 
                    ? `${Math.round(metrics.videoCompletionRate)}%`
                    : '0%'
                  }
                </p>
              </div>
              <Video className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Search Queries</p>
                <p className="text-2xl font-bold">{metrics?.searchQueries?.length || 0}</p>
              </div>
              <Search className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Viewed Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.popularContent?.length ? (
                metrics.popularContent.map((content, index) => (
                  <div key={content.content_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{content.title}</p>
                        <p className="text-xs text-gray-600">{content.views} views</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No content views yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Top Search Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.searchQueries?.length ? (
                metrics.searchQueries.map((query, index) => (
                  <div key={query.search_term} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">"{query.search_term}"</p>
                        <p className="text-xs text-gray-600">{query.count} searches</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No searches yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
