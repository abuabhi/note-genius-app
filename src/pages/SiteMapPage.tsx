import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";

const sections: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Public",
    links: [
      { href: "/", label: "Home" },
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/help", label: "Help Center" },
      { href: "/faq", label: "FAQ" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
  {
    title: "App (requires sign in)",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/notes", label: "Notes" },
      { href: "/flashcards", label: "Flashcards" },
      { href: "/quizzes", label: "Quizzes" },
      { href: "/study-sessions", label: "Study Sessions" },
      { href: "/progress", label: "Progress" },
      { href: "/analytics", label: "Analytics" },
      { href: "/goals", label: "Goals" },
      { href: "/todos", label: "To‑Dos" },
      { href: "/schedule", label: "Schedule" },
      { href: "/study-planner", label: "Study Planner" },
      { href: "/reminders", label: "Reminders" },
      { href: "/notifications", label: "Notifications" },
      { href: "/settings", label: "Settings" },
    ],
  },
  {
    title: "Misc",
    links: [
      { href: "/onboarding", label: "Onboarding" },
      { href: "/test-enhancement", label: "Test Enhancement" },
      { href: "/google-docs-test", label: "Google Docs Test" },
    ],
  },
];

function canonicalUrl() {
  if (typeof window === "undefined") return "/sitemap";
  const { origin } = window.location;
  return `${origin}/sitemap`;
}

const SiteMapPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Site Map | Study App</title>
        <meta name="description" content="Browse all public and signed-in pages in our app. Quick links to features, help center, and account areas." />
        <link rel="canonical" href={canonicalUrl()} />
      </Helmet>

      <header className="container mx-auto px-4 md:px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Site Map</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">All key pages at a glance. Use this directory to quickly navigate across the app.</p>
      </header>

      <main className="container mx-auto px-4 md:px-6 pb-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border bg-background p-6 shadow-sm">
              <h2 className="text-xl font-medium mb-4">{section.title}</h2>
              <nav aria-label={`${section.title} links`}>
                <ul className="space-y-2">
                  {section.links.map((l) => (
                    <li key={l.href}>
                      <Link className="text-primary hover:underline" to={l.href}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </section>
          ))}
        </div>

        <aside className="mt-10 text-sm text-muted-foreground">
          <p>Note: Some routes include dynamic segments (e.g., /notes/:id) and are not listed here.</p>
        </aside>
      </main>
    </Layout>
  );
};

export default SiteMapPage;
