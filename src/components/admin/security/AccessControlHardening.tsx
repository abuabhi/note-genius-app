import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Clock, AlertTriangle, Users, Ban } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionSecurityData {
  session_count: number;
  failed_attempts: number;
  is_locked: boolean;
  max_sessions_allowed: number;
  security_status: string;
}

interface RateLimitConfig {
  action_type: string;
  max_requests: number;
  window_minutes: number;
  enabled: boolean;
}

export const AccessControlHardening = () => {
  const [ipRestrictions, setIpRestrictions] = useState<string[]>([]);
  const [newIp, setNewIp] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [rateLimitConfigs, setRateLimitConfigs] = useState<RateLimitConfig[]>([
    { action_type: 'user_management', max_requests: 10, window_minutes: 60, enabled: true },
    { action_type: 'financial_access', max_requests: 5, window_minutes: 60, enabled: true },
    { action_type: 'security_audit', max_requests: 20, window_minutes: 60, enabled: true },
  ]);

  // Fetch current session security status
  const { data: sessionData } = useQuery({
    queryKey: ['session-security'],
    queryFn: async () => {
      // This would typically get the current user's session data
      const mockData: SessionSecurityData = {
        session_count: 2,
        failed_attempts: 0,
        is_locked: false,
        max_sessions_allowed: 5,
        security_status: 'normal'
      };
      return mockData;
    },
    refetchInterval: 30000,
  });

  const handleAddIpRestriction = () => {
    if (newIp && !ipRestrictions.includes(newIp)) {
      setIpRestrictions([...ipRestrictions, newIp]);
      setNewIp('');
      toast.success('IP restriction added');
    }
  };

  const handleRemoveIpRestriction = (ip: string) => {
    setIpRestrictions(ipRestrictions.filter(i => i !== ip));
    toast.success('IP restriction removed');
  };

  const handleUpdateRateLimit = (index: number, field: keyof RateLimitConfig, value: any) => {
    const newConfigs = [...rateLimitConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setRateLimitConfigs(newConfigs);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-500';
      case 'suspicious':
        return 'bg-yellow-500';
      case 'high_risk':
        return 'bg-orange-500';
      case 'locked':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Access Control Hardening</h2>
        <p className="text-muted-foreground">Enhanced security controls and access restrictions</p>
      </div>

      {/* Session Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Session Security Status
          </CardTitle>
          <CardDescription>
            Real-time monitoring of user session security and authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {sessionData?.session_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-orange-500">
                {sessionData?.failed_attempts || 0}
              </div>
              <div className="text-sm text-muted-foreground">Failed Attempts</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {sessionData?.max_sessions_allowed || 5}
              </div>
              <div className="text-sm text-muted-foreground">Max Sessions</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(sessionData?.security_status || 'normal')} text-white`}
              >
                {sessionData?.security_status?.toUpperCase() || 'NORMAL'}
              </Badge>
              <div className="text-sm text-muted-foreground mt-2">Security Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP-Based Access Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            IP-Based Access Restrictions
          </CardTitle>
          <CardDescription>
            Restrict access to sensitive operations by IP address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-ip">Add IP Address</Label>
              <Input
                id="new-ip"
                placeholder="192.168.1.100"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddIpRestriction}>Add Restriction</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Current IP Restrictions</Label>
            {ipRestrictions.length > 0 ? (
              <div className="space-y-2">
                {ipRestrictions.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                    <span className="font-mono text-sm">{ip}</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveIpRestriction(ip)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No IP restrictions configured</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Security Settings
          </CardTitle>
          <CardDescription>
            Configure session timeouts and security controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input
              id="session-timeout"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
              min="5"
              max="480"
            />
            <p className="text-sm text-muted-foreground">
              Sessions will automatically expire after this duration of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rate Limiting Configuration
          </CardTitle>
          <CardDescription>
            Configure rate limits for different admin operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rateLimitConfigs.map((config, index) => (
              <div key={config.action_type} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">
                    {config.action_type.replace('_', ' ')}
                  </h4>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(checked) => handleUpdateRateLimit(index, 'enabled', checked)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max Requests</Label>
                    <Input
                      type="number"
                      value={config.max_requests}
                      onChange={(e) => handleUpdateRateLimit(index, 'max_requests', parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label>Window (minutes)</Label>
                    <Input
                      type="number"
                      value={config.window_minutes}
                      onChange={(e) => handleUpdateRateLimit(index, 'window_minutes', parseInt(e.target.value))}
                      min="1"
                      max="1440"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Enhancement Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Enhancement Actions
          </CardTitle>
          <CardDescription>
            Quick actions to enhance system security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Force Session Refresh</span>
              <span className="text-xs text-muted-foreground">All users</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Ban className="h-5 w-5" />
              <span>Emergency Lockdown</span>
              <span className="text-xs text-muted-foreground">Admin only access</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Shield className="h-5 w-5" />
              <span>Security Audit</span>
              <span className="text-xs text-muted-foreground">Full system scan</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-5 w-5" />
              <span>Revoke All Sessions</span>
              <span className="text-xs text-muted-foreground">Force re-login</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};