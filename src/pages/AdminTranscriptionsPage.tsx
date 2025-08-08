import React from 'react';
import { Helmet } from 'react-helmet';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminTranscriptionsPage = () => {
  return (
    <AdminLayout>
      <Helmet>
        <title>Apify YouTube Count | Admin Dashboard</title>
        <meta name="description" content="Monitor Apify YouTube transcription counts and usage." />
        <link rel="canonical" href="/admin/transcriptions" />
      </Helmet>
      <main className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">YouTube Transcriptions (Apify)</h1>
            <p className="text-muted-foreground">
              Track Apify transcript extraction usage and counts.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Transcriptions</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminTranscriptionsPage;
