import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../features/shared/Footer';
import { ROUTES } from '../../constants/routes';
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  CheckCircle,
  UserPlus,
  Coins,
  MessageCircle,
  Shield,
  Globe,
  Clock,
  BookOpen,
  Search,
  ListChecks,
  Users
} from 'lucide-react';

export default function Home() {
  return (
    <>
      <main className="text-slate-800">
        {/* Hero — brighter strip over AppPageShell */}
        <section className="border-b border-sky-200/70 bg-white/85 px-4 pt-14 pb-16 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.6)] backdrop-blur-sm sm:px-6 lg:px-8 lg:pt-20 lg:pb-20">
          <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
            <p className="text-sm font-medium uppercase tracking-wide text-sky-800/80">
              Students &amp; professionals
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              A clear way to post needs, discover experts, and connect—with a simple coin-based system.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 lg:text-lg">
              SkillBridge helps students find help and helps professionals find serious inquiries. Profiles,
              messaging, and applications stay organized so you can focus on the work—not on noise.
            </p>
            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2"
              >
                Create an account
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50/60"
              >
                How it works
              </a>
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center justify-center text-sm font-medium text-sky-800 underline-offset-4 hover:underline sm:px-2"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* Audience split */}
        <section className="bg-gradient-to-b from-white/60 to-sky-50/25 px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Built for two sides of the same marketplace</h2>
              <p className="mt-3 text-slate-600">
                Same platform, different journeys—whether you&apos;re hiring expertise or offering it.
              </p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="flex flex-col rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-100 ring-1 ring-sky-200/80">
                  <Briefcase className="h-5 w-5 text-sky-800" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">For professionals &amp; tutors</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Present your experience, browse relevant opportunities, and respond when a match fits your skills.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {[
                    'Profile and credentials in one place',
                    'Apply or connect using the platform wallet',
                    'Message clients without handing off to random threads'
                  ].map((line) => (
                    <li key={line} className="flex gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={2} aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={ROUTES.REGISTER}
                  className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-sky-800 hover:text-sky-950"
                >
                  Register as a professional
                  <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </Link>
              </div>

              <div className="flex flex-col rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 ring-1 ring-teal-200/80">
                  <GraduationCap className="h-5 w-5 text-teal-800" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">For students &amp; clients</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Post what you need, compare experts, and start conversations with people who fit your goals.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {[
                    'Clear listings and search to find the right fit',
                    'Coins keep outreach intentional and the platform sustainable',
                    'Keep chats and job context in one workspace'
                  ].map((line) => (
                    <li key={line} className="flex gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={2} aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={ROUTES.REGISTER}
                  className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:text-teal-950"
                >
                  Register as a student
                  <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works — high-luminance band */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-y border-sky-200/90 bg-gradient-to-b from-white via-sky-50/90 to-sky-100/50 px-4 py-16 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="relative mx-auto max-w-7xl">
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[min(100%,56rem)] -translate-x-1/2 rounded-full bg-sky-200/35 blur-3xl"
              aria-hidden
            />
            <div className="relative mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Simple flow</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">How it works</h2>
              <p className="mt-3 text-base text-slate-700">
                Create your account, add coins, then reach the right professionals or students.
              </p>
            </div>
            <div className="relative mt-12 grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
              {[
                {
                  step: '1',
                  title: 'Create account',
                  body: 'Register as a student or professional and set up your profile so others know how you can work together.',
                  icon: UserPlus
                },
                {
                  step: '2',
                  title: 'Buy coins',
                  body: 'Top up your wallet so you can apply to listings, start chats, and use premium actions when you are ready.',
                  icon: Coins
                },
                {
                  step: '3',
                  title: 'Connect with professionals / students',
                  body: 'Use search and listings to find a match, then connect and keep the conversation in one place.',
                  icon: Users
                }
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-xl border border-sky-200/80 bg-white p-6 shadow-[0_12px_40px_-12px_rgba(14,165,233,0.2)] ring-1 ring-white/90"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-white shadow-md">
                      {item.step}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/90">
                      <item.icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </div>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="relative mx-auto mt-12 max-w-3xl rounded-xl border border-amber-200/90 bg-amber-50 px-5 py-7 text-center shadow-sm shadow-amber-100/50 sm:px-8">
              <p className="text-sm font-semibold text-amber-900">Why coins?</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">
                A small cost to connect reduces spam and helps keep the service available—without hiding fees in fine print.
                You always know what an action costs before you confirm.
              </p>
            </div>
          </div>
        </section>

        {/* Credibility — honest framing, no fabricated metrics */}
        <section className="bg-white/70 px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">What you can do on SkillBridge</h2>
              <p className="mt-3 text-slate-600">
                Practical capabilities today—not a wishlist dressed up as a feature wall.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Search, title: 'Discovery', text: 'Search and filters to narrow experts or listings.' },
                { icon: ListChecks, title: 'Structured flows', text: 'Onboarding and job flows designed to reduce back-and-forth.' },
                { icon: Shield, title: 'Account security', text: 'Sign-in and session handling built for real use.' },
                { icon: Globe, title: 'Work from anywhere', text: 'Online-friendly workflows for distributed students and pros.' }
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-800 ring-1 ring-sky-100">
                    <item.icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature grid — tighter copy */}
        <section className="border-t border-sky-100/80 bg-gradient-to-b from-sky-50/40 to-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Tools that support the relationship</h2>
              <p className="mt-3 text-slate-600">
                Messaging, wallet, and profiles work together on one site.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: 'Clear expertise signals',
                  description: 'Skills and history visible before you spend time in chat.'
                },
                {
                  icon: Clock,
                  title: 'Work at your pace',
                  description: 'Respond when it fits your schedule; notifications stay in the product.'
                },
                {
                  icon: MessageCircle,
                  title: 'Direct messaging',
                  description: 'Keep context with each job or introduction—less lost email.'
                }
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700 ring-1 ring-slate-200/80">
                    <f.icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-slate-700/20 bg-slate-800 px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Start with a free account</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Choose student or professional when you register—then complete your profile to get the most from listings,
              search, and messaging.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-sky-50"
              >
                Get started
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center justify-center rounded-lg border border-slate-500 bg-transparent px-6 py-3 text-sm font-medium text-white transition-colors hover:border-slate-400 hover:bg-white/5"
              >
                Already registered? Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
