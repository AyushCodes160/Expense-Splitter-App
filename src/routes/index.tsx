import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Wallet, Sparkles, Users, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Splitly — Smart Expense Splitter for Groups" },
      {
        name: "description",
        content:
          "Track shared expenses, split flexibly, and settle debts with the fewest payments. Built for friends, trips, and households.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl btn-gradient">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">Splitly</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" id="hero-login-btn">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="btn-gradient" id="hero-register-btn">
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-12 pb-24 text-center sm:pt-20">
        <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Smart debt minimization · Equal · Unequal · Percentage
        </div>

        <h1 className="animate-fade-in-up mt-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Split bills.<br />
          <span className="gradient-text">Settle smarter.</span>
        </h1>

        <p className="animate-fade-in-up mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Track every shared expense, split it flexibly, and let our smart algorithm
          minimize the number of payments needed to settle up.
        </p>

        <div className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="btn-gradient h-12 px-8 text-base" id="cta-start">
            <Link to="/register">
              Start splitting <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base glass" id="cta-login">
            <Link to="/login">I have an account</Link>
          </Button>
        </div>

        <div className="animate-fade-in-up mt-20 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, title: "Group expenses", desc: "Roommates, trips, dinners — track them all in one place." },
            { icon: Calculator, title: "Flexible splits", desc: "Equal, unequal, or percentage. Whatever's fair." },
            { icon: Sparkles, title: "Smart settle-up", desc: "Greedy algorithm minimizes who pays whom." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-glow">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
