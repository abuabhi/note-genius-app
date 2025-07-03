import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Copy, Calendar, Users, Target, TrendingUp } from 'lucide-react';
import { useCouponManagement } from '@/hooks/admin/useCouponManagement';
import { CreateCouponDialog } from './CreateCouponDialog';
import { CouponStatsCards } from './CouponStatsCards';
import { toast } from 'sonner';

export const CouponManagementPage = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { coupons, isLoading, deleteCoupon } = useCouponManagement();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Coupon code copied to clipboard');
  };

  const getDiscountDisplay = (coupon: any) => {
    if (coupon.discount_percentage) {
      return `${coupon.discount_percentage}% off`;
    } else if (coupon.discount_amount) {
      return `${formatCurrency(coupon.discount_amount)} off`;
    }
    return 'No discount';
  };

  const getStatusBadge = (coupon: any) => {
    if (!coupon.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (coupon.usage_limit && coupon.current_usage >= coupon.usage_limit) {
      return <Badge variant="destructive">Usage Limit Reached</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Stats Overview */}
      <CouponStatsCards />

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-[400px] grid-cols-3">
            <TabsTrigger value="active">Active Coupons</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="all">All Coupons</TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>

        <TabsContent value="active" className="space-y-4">
          <CouponGrid 
            coupons={coupons?.filter(c => 
              c.is_active && 
              (!c.expires_at || new Date(c.expires_at) > new Date()) &&
              (!c.usage_limit || c.current_usage < c.usage_limit)
            ) || []}
            onCopyCode={copyToClipboard}
            onDeactivate={deleteCoupon}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getDiscountDisplay={getDiscountDisplay}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <CouponGrid 
            coupons={coupons?.filter(c => 
              !c.is_active || 
              (c.expires_at && new Date(c.expires_at) <= new Date()) ||
              (c.usage_limit && c.current_usage >= c.usage_limit)
            ) || []}
            onCopyCode={copyToClipboard}
            onDeactivate={deleteCoupon}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getDiscountDisplay={getDiscountDisplay}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <CouponGrid 
            coupons={coupons || []}
            onCopyCode={copyToClipboard}
            onDeactivate={deleteCoupon}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getDiscountDisplay={getDiscountDisplay}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>

      <CreateCouponDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

interface CouponGridProps {
  coupons: any[];
  onCopyCode: (code: string) => void;
  onDeactivate: (id: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  getDiscountDisplay: (coupon: any) => string;
  getStatusBadge: (coupon: any) => React.ReactNode;
}

const CouponGrid = ({ 
  coupons, 
  onCopyCode, 
  onDeactivate, 
  formatCurrency, 
  formatDate, 
  getDiscountDisplay, 
  getStatusBadge 
}: CouponGridProps) => {
  if (coupons.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No coupons found in this category
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {coupons.map((coupon) => (
        <Card key={coupon.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-mono bg-muted px-2 py-1 rounded">
                {coupon.coupon_code}
              </CardTitle>
              {getStatusBadge(coupon)}
            </div>
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {coupon.profiles?.username || 'Unknown'}
              <Badge variant="outline" className="ml-auto">
                {coupon.profiles?.user_tier || 'GRADUATE'}
              </Badge>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Discount</div>
                <div className="font-semibold text-primary">
                  {getDiscountDisplay(coupon)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Usage</div>
                <div className="font-semibold">
                  {coupon.current_usage}
                  {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' uses'}
                </div>
              </div>
            </div>

            {coupon.expires_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Expires: {formatDate(coupon.expires_at)}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyCode(coupon.coupon_code)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Code
              </Button>
              
              {coupon.is_active && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeactivate(coupon.id)}
                >
                  Deactivate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};