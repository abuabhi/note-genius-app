import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Globe, Clock } from 'lucide-react';

interface UptimeRobotMonitorManagerProps {
  onMonitorChange: () => void;
}

const UptimeRobotMonitorManager = ({ onMonitorChange }: UptimeRobotMonitorManagerProps) => {
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: '1', // HTTP(s)
    interval: '300' // 5 minutes
  });
  const { toast } = useToast();

  const monitorTypes = [
    { value: '1', label: 'HTTP(s)' },
    { value: '2', label: 'Keyword' },
    { value: '3', label: 'Ping' },
    { value: '4', label: 'Port' }
  ];

  const intervals = [
    { value: '60', label: '1 minute' },
    { value: '300', label: '5 minutes' },
    { value: '600', label: '10 minutes' },
    { value: '900', label: '15 minutes' },
    { value: '1800', label: '30 minutes' },
    { value: '3600', label: '1 hour' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateMonitor = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('uptimerobot-api', {
        body: { 
          action: 'createMonitor',
          monitorData: {
            name: formData.name,
            url: formData.url,
            type: parseInt(formData.type),
            interval: parseInt(formData.interval)
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Success",
          description: "Monitor created successfully",
        });
        setFormData({ name: '', url: '', type: '1', interval: '300' });
        onMonitorChange();
      } else {
        throw new Error(data?.error || 'Failed to create monitor');
      }
    } catch (error) {
      console.error('Error creating monitor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create monitor",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const createQuickMonitors = async () => {
    const quickMonitors = [
      {
        name: 'Main Website',
        url: window.location.origin,
        type: 1,
        interval: 300
      }
    ];

    setCreating(true);
    try {
      for (const monitor of quickMonitors) {
        await supabase.functions.invoke('uptimerobot-api', {
          body: { 
            action: 'createMonitor',
            monitorData: monitor
          }
        });
      }

      toast({
        title: "Success",
        description: "Quick monitors created successfully",
      });
      onMonitorChange();
    } catch (error) {
      console.error('Error creating quick monitors:', error);
      toast({
        title: "Error",
        description: "Failed to create some monitors",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Quick Setup
          </CardTitle>
          <CardDescription>
            Create monitors for your main application automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium">Will create monitors for:</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Main Website: {window.location.origin}</li>
                <li>• Check interval: 5 minutes</li>
                <li>• Monitor type: HTTP(s)</li>
              </ul>
            </div>
            <Button 
              onClick={createQuickMonitors} 
              disabled={creating}
              className="w-fit"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Quick Monitors
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Create Custom Monitor</CardTitle>
          <CardDescription>
            Add a custom monitor for any URL or service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monitor-name">Monitor Name *</Label>
              <Input
                id="monitor-name"
                placeholder="e.g., Main Website"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monitor-url">URL *</Label>
              <Input
                id="monitor-url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monitor-type">Monitor Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monitorTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monitor-interval">Check Interval</Label>
              <Select value={formData.interval} onValueChange={(value) => handleInputChange('interval', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {intervals.map((interval) => (
                    <SelectItem key={interval.value} value={interval.value}>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {interval.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleCreateMonitor} 
            disabled={creating || !formData.name.trim() || !formData.url.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {creating ? 'Creating Monitor...' : 'Create Monitor'}
          </Button>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Monitor your main pages</p>
                <p className="text-muted-foreground">
                  Include your homepage, API endpoints, and critical user flows
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Use appropriate intervals</p>
                <p className="text-muted-foreground">
                  5 minutes for critical services, 15-30 minutes for less critical ones
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Set up alerts</p>
                <p className="text-muted-foreground">
                  Configure email/SMS notifications in your UptimeRobot account
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UptimeRobotMonitorManager;