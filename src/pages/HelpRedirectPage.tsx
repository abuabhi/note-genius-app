import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Search,
  FileText,
  Layers,
  Brain,
  Calendar,
  Target,
  BarChart3,
  BookOpen,
  Users,
  Sparkles,
  LifeBuoy,
  Mail,
  MessageSquare,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type Topic = {
  id: string;
  title: string;
  body: string;
  link?: { to: string; label: string };
};

type Section = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  topics: Topic[];
};

const SECTIONS: Section[] = [
  {
    id: 'study',
    title: 'Study',
    icon: BookOpen,
    topics: [
      {
        id: 'notes',
        title: 'Notes — create, import, enrich',
        body:
          'Create notes from scratch, paste text, import PDFs, or capture handwriting with OCR. Use AI enrichment to summarise, extract key points, generate questions or convert to clean Markdown. Notes autosave as you type — if your tab crashes, your draft is restored on reload.',
        link: { to: '/notes', label: 'Open Notes' },
      },
      {
        id: 'chat-notes',
        title: 'Chat with your notes',
        body:
          'Open any note and ask questions about it. The AI uses the note content as context, so answers stay grounded in what you actually wrote or imported.',
        link: { to: '/notes', label: 'Open Notes' },
      },
      {
        id: 'flashcards',
        title: 'Flashcards — create & AI-generate',
        body:
          'Build sets manually or generate cards from a note in one click. Generated cards are length-checked and de-duplicated server-side, and low-quality cards are dropped before they reach you. Study using flip, spaced repetition, or quick review modes.',
        link: { to: '/flashcards', label: 'Open Flashcards' },
      },
      {
        id: 'quiz',
        title: 'Quiz — generate, take, review',
        body:
          'Generate multiple-choice quizzes from any note. Each question is validated for length and answer integrity. If you leave mid-quiz, your progress is saved as a draft and offered on return.',
        link: { to: '/quizzes', label: 'Open Quizzes' },
      },
    ],
  },
  {
    id: 'plan',
    title: 'Plan',
    icon: Calendar,
    topics: [
      {
        id: 'schedule',
        title: 'Schedule, events & reminders',
        body:
          'Add study sessions, exams and deadlines to your calendar. Set reminders so you never miss a session. The study planner can suggest blocks based on your goals.',
        link: { to: '/schedule', label: 'Open Schedule' },
      },
      {
        id: 'goals',
        title: 'Goals & tasks',
        body:
          'Define weekly or term goals and break them into tasks. Tick them off as you progress — completion feeds into your analytics streaks.',
        link: { to: '/goals', label: 'Open Goals' },
      },
    ],
  },
  {
    id: 'insight',
    title: 'Insight',
    icon: BarChart3,
    topics: [
      {
        id: 'analytics',
        title: 'Analytics & progress',
        body:
          'See study time, session counts, quiz accuracy and flashcard retention over time. Use it to spot subjects that need more attention.',
        link: { to: '/analytics', label: 'Open Analytics' },
      },
      {
        id: 'resources',
        title: 'Resources library',
        body:
          'Curated study resources organised by subject. Save the ones that help you and revisit them from your dashboard.',
        link: { to: '/resources', label: 'Open Resources' },
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    icon: Users,
    topics: [
      {
        id: 'tiers',
        title: 'Tiers, limits & upgrading',
        body:
          'Free, Pro and higher tiers unlock more AI generations, larger note imports and advanced analytics. Manage your plan and billing from your account settings.',
        link: { to: '/account', label: 'Manage account' },
      },
      {
        id: 'referrals',
        title: 'Referrals & rewards',
        body:
          'Share your referral link to earn credits when friends sign up. Track referrals and rewards from the referrals page.',
        link: { to: '/referrals', label: 'Open Referrals' },
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI',
    icon: Sparkles,
    topics: [
      {
        id: 'how-ai-works',
        title: 'How AI generation works',
        body:
          'AI features (note enrichment, flashcards, quizzes, explanations) run through our AI gateway. Outputs are validated server-side: length-capped, de-duplicated and stripped of malformed entries. If items are dropped, you see "Generated N (M discarded as low quality)".',
      },
      {
        id: 'report-ai',
        title: 'Reporting bad AI output',
        body:
          'Every AI-generated card, question and note enrichment has a "Report" action. Use it when something is wrong, misleading or off-topic — your reports help us tune prompts and quality gates.',
      },
      {
        id: 'ai-limits',
        title: 'Monthly AI limits',
        body:
          'Each tier has a monthly AI generation budget. You can see your remaining quota from the account page. Upgrading raises the cap immediately.',
        link: { to: '/account', label: 'Check usage' },
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: LifeBuoy,
    topics: [
      {
        id: 'autosave',
        title: 'Autosave & draft recovery',
        body:
          'Notes autosave as you type and a quiz in progress is kept as a draft. If you lose connection or close the tab, reopen the note or quiz and you will be prompted to restore your draft.',
      },
      {
        id: 'limits',
        title: 'Hitting a limit?',
        body:
          'If a generate button is disabled or returns an error, you may have hit your monthly AI quota or a per-minute rate limit. Wait a minute, or upgrade your tier for a higher cap.',
      },
      {
        id: 'slow',
        title: 'App feels slow',
        body:
          'Try a hard refresh (Cmd/Ctrl+Shift+R). If a specific page is slow, switching subject filters or clearing search can help. Persistent issues — please contact us.',
      },
      {
        id: 'imports',
        title: 'PDF or image import failed',
        body:
          'Very large PDFs (>50 MB) and low-resolution scans can fail OCR. Try splitting the PDF or rescanning at higher resolution. For password-protected PDFs, remove the password first.',
      },
    ],
  },
];

const QUICK_START = [
  {
    icon: FileText,
    title: 'Create your first note',
    desc: 'Start a note, paste text or import a PDF — autosave keeps your work safe.',
    to: '/notes',
  },
  {
    icon: Layers,
    title: 'Generate flashcards from a note',
    desc: 'Open any note and click "Generate flashcards" — quality-checked AI cards in seconds.',
    to: '/flashcards',
  },
  {
    icon: Brain,
    title: 'Take your first quiz',
    desc: 'Generate a quiz from a note, answer the questions, review explanations.',
    to: '/quizzes',
  },
];

const HelpCenterPage = () => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS
      .map(section => ({
        ...section,
        topics: section.topics.filter(
          t =>
            t.title.toLowerCase().includes(q) ||
            t.body.toLowerCase().includes(q),
        ),
      }))
      .filter(section => section.topics.length > 0);
  }, [query]);

  return (
    <Layout>
      <Helmet>
        <title>Help Center — PrepGenie</title>
        <meta
          name="description"
          content="Guides for notes, flashcards, quizzes, schedule, AI features, account and troubleshooting in PrepGenie."
        />
        <link rel="canonical" href="/help" />
      </Helmet>

      <div className="container mx-auto px-4 py-10 md:py-16 max-w-5xl">
        {/* Hero + search */}
        <header className="text-center space-y-4 mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">
            How can we help?
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Search guides for every PrepGenie feature, or browse by area below.
          </p>
          <div className="relative max-w-xl mx-auto pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-mint-500" />
            <Input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search help topics..."
              className="pl-10 h-11 border-mint-200 focus-visible:ring-mint-400"
              autoComplete="off"
            />
          </div>
        </header>

        {/* Quick start */}
        {!query && (
          <section className="mb-12" aria-labelledby="quick-start">
            <h2 id="quick-start" className="text-xl font-semibold mb-4 text-foreground">
              Quick start
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {QUICK_START.map(item => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="border-mint-100 hover:border-mint-300 transition-colors">
                    <CardHeader>
                      <div className="h-10 w-10 rounded-lg bg-mint-50 flex items-center justify-center mb-2">
                        <Icon className="h-5 w-5 text-mint-600" />
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription>{item.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link to={item.to}>
                          Get started <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Browse by feature */}
        <section aria-labelledby="browse">
          <h2 id="browse" className="text-xl font-semibold mb-4 text-foreground">
            {query ? `Results for "${query}"` : 'Browse by feature'}
          </h2>

          {filtered.length === 0 && (
            <Card className="border-mint-100">
              <CardContent className="py-10 text-center text-muted-foreground">
                No topics matched. Try a different keyword, or{' '}
                <Link to="/contact" className="text-mint-600 hover:underline">
                  contact support
                </Link>
                .
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map(section => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="border-mint-100">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-mint-50 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-mint-600" />
                      </div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="w-full">
                      {section.topics.map(topic => (
                        <AccordionItem key={topic.id} value={topic.id}>
                          <AccordionTrigger className="text-left text-sm font-medium">
                            {topic.title}
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {topic.body}
                            </p>
                            {topic.link && (
                              <Button asChild variant="ghost" size="sm" className="px-0 h-auto text-mint-600 hover:bg-transparent hover:text-mint-700">
                                <Link to={topic.link.to}>
                                  {topic.link.label} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Footer card */}
        <section className="mt-12">
          <Card className="border-mint-200 bg-mint-50/50">
            <CardHeader>
              <CardTitle className="text-lg">Still need help?</CardTitle>
              <CardDescription>
                Check our full FAQ or get in touch — we usually reply within a working day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="default" size="sm">
                  <Link to="/contact">
                    <Mail className="mr-2 h-4 w-4" /> Contact support
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/feedback">
                    <MessageSquare className="mr-2 h-4 w-4" /> Send feedback
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/faq">
                    <HelpCircle className="mr-2 h-4 w-4" /> Browse the FAQ
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default HelpCenterPage;
