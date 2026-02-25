import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, BarChart3, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg teal-gradient" />
            <span className="font-bold text-lg">TrendScape</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="teal-gradient text-white border-0">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal-light text-brand-teal text-sm font-medium">
              <Zap className="w-3.5 h-3.5" />
              TikTok Trend Intelligence
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gradient">
              Know what&apos;s trending before it peaks
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              TrendScape identifies high-velocity TikTok trends in your industry, scores their
              breakout potential, and generates AI-powered strategy notes so your brand can
              move fast.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Link href="/signup">
                <Button size="lg" className="teal-gradient text-white border-0">
                  Start free trial
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 border-t">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-teal-light flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-teal" />
              </div>
              <h3 className="font-semibold text-lg">Trend Detection</h3>
              <p className="text-muted-foreground text-sm">
                Automated scraping and clustering identifies emerging hashtag groups,
                trending audio, and cultural moments in your niche.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-teal-light flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-brand-teal" />
              </div>
              <h3 className="font-semibold text-lg">Velocity Scoring</h3>
              <p className="text-muted-foreground text-sm">
                Proprietary velocity and breakout scores tell you exactly how fast a trend
                is moving and whether it&apos;s worth jumping on.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-teal-light flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-teal" />
              </div>
              <h3 className="font-semibold text-lg">AI Strategy Notes</h3>
              <p className="text-muted-foreground text-sm">
                Claude AI analyzes each trend through your brand&apos;s lens, generating
                specific content ideas and risk assessments.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
