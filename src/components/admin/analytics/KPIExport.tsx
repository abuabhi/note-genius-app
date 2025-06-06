
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DateRange {
  start: Date;
  end: Date;
}

interface KPIExportProps {
  dateRange: DateRange;
}

export const KPIExport = ({ dateRange }: KPIExportProps) => {
  const { toast } = useToast();

  const { data: exportData } = useQuery({
    queryKey: ['kpi-export-data', dateRange],
    queryFn: async () => {
      // Gather all KPI data
      const { data: mrr } = await supabase.rpc('calculate_mrr');
      const { data: arr } = await supabase.rpc('calculate_arr');
      const { data: churnRate } = await supabase.rpc('calculate_churn_rate');
      const { data: dau } = await supabase.rpc('calculate_dau');
      const { data: mau } = await supabase.rpc('calculate_mau');
      const { data: avgSessionLength } = await supabase.rpc('calculate_avg_session_length');

      const { data: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      const { data: newSignups } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      return {
        dateRange: {
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0]
        },
        revenue: {
          mrr: mrr || 0,
          arr: arr || 0,
          churnRate: churnRate || 0
        },
        users: {
          totalUsers: totalUsers?.length || 0,
          dau: dau || 0,
          mau: mau || 0,
          newSignups: newSignups?.length || 0
        },
        engagement: {
          avgSessionLengthMinutes: ((avgSessionLength || 0) / 60).toFixed(1)
        },
        generatedAt: new Date().toISOString()
      };
    }
  });

  const handleExport = () => {
    if (!exportData) return;

    const csvContent = [
      ['Metric', 'Value', 'Unit'],
      ['Date Range Start', exportData.dateRange.start, 'date'],
      ['Date Range End', exportData.dateRange.end, 'date'],
      ['MRR', exportData.revenue.mrr, 'USD'],
      ['ARR', exportData.revenue.arr, 'USD'],
      ['Churn Rate', exportData.revenue.churnRate, '%'],
      ['Total Users', exportData.users.totalUsers, 'count'],
      ['Daily Active Users', exportData.users.dau, 'count'],
      ['Monthly Active Users', exportData.users.mau, 'count'],
      ['New Signups', exportData.users.newSignups, 'count'],
      ['Avg Session Length', exportData.engagement.avgSessionLengthMinutes, 'minutes'],
      ['Generated At', exportData.generatedAt, 'datetime']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `kpi-report-${exportData.dateRange.start}-to-${exportData.dateRange.end}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "KPI Report Exported",
      description: "Your KPI data has been exported as a CSV file.",
    });
  };

  return (
    <Button onClick={handleExport} disabled={!exportData}>
      <Download className="mr-2 h-4 w-4" />
      Export KPIs
    </Button>
  );
};
