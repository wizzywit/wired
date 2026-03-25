import { Link } from 'react-router-dom';
import { AppTopNav } from '../components/layout/AppTopNav/AppTopNav';

const demos = [
  {
    to: '/landing',
    title: 'Marketing landing',
    desc: 'Hero, bento features, testimonial, dark CTA — editorial marketing page.',
  },
  {
    to: '/login',
    title: 'Login',
    desc: 'Glass auth card, SSO, email — infinite grid background.',
  },
  {
    to: '/signup',
    title: 'Sign up',
    desc: 'Split hero + form, password visibility, social auth row.',
  },
  {
    to: '/dashboard',
    title: 'Studio Browser',
    desc: 'Templates gallery, workspace nav, recent boards — desktop + mobile layouts.',
  },
  {
    to: '/share',
    title: 'Share & collaborate',
    desc: 'Glass modal, invites, link access, role rows.',
  },
  {
    to: '/syncing',
    title: 'Canvas syncing',
    desc: 'Dark studio shell with skeleton flow and saving pulse.',
  },
  {
    to: '/export',
    title: 'Export & settings',
    desc: 'Export drawer, format chips, canvas toggles.',
  },
  {
    to: '/loading',
    title: 'Dashboard loading',
    desc: 'Ether skeletons, top progress glide, sync glow.',
  },
] as const;

export function GalleryScreen() {
  return (
    <div className="min-h-dvh bg-background">
      <AppTopNav showAppLinks={false} />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-24">
        <header className="mb-12 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-outline">The Wired Studio — design system</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-on-surface">Sample views</h1>
          <p className="max-w-xl text-on-surface-variant">
            Token-driven surfaces, glass panels, and gradients from Stitch exports. Toggle light/dark in the header;
            resize for mobile patterns.{' '}
            <Link to="/landing" className="font-semibold text-primary hover:underline">
              Marketing landing
            </Link>
            ,{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              login
            </Link>
            , and{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              sign up
            </Link>
            .
          </p>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2">
          {demos.map((d) => (
            <li key={d.to}>
              <Link
                to={d.to}
                className="block rounded-2xl bg-surface-container-lowest p-6 shadow-card transition-all hover:shadow-cardHover dark:bg-surface-container"
              >
                <h2 className="font-semibold text-on-surface">{d.title}</h2>
                <p className="mt-2 text-sm text-on-surface-variant">{d.desc}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary">Open →</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
