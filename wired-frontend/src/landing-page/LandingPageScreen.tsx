import { Link } from 'react-router-dom'
import { Icon } from '../components/common/Icon'
import { useTheme } from '../context/ThemeContext'

const heroImg =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC7clFdyRsvWsSFOwcoXpiu0miq0-tWMY44KDQMqEyDP1cf8n1Luv18cJtgo4JJ2yrvWUmMjGbpeXcpbNsSY5SEQsDYopyPp2XPG33ydLnvtJVW3cEcLXSxOg14q-QYHz97fvbbu27SpWOoX-enld4a8xc-_jXPHXK2XWnHHQIuDO2DAg7xYW1_Alxqu3ZThnVCUNL5MvndtMt63QCuB3SUfn_Ld0Aw_d5wlTAmh1dheHt_4_WgJRyCbGfVGpVwZrRCbBT_lx91yhco'

const showcaseImg =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBz1yv6nyGHaNZDDVK2kNfPvki_wTYw5aBKZAT8ZxeC-YllSenZyR7cEmLBMYVsAohElcsKhs1JPiNM5qU4IcimolJxlIIY2JM-Ch_8s0x2mgUgzzSqmOFZMuw9eqvL66VRLqshXDXtmKgFdf-8rnOKO57zc6RpQHYmOG6PeElHoreyzR-jBW4GCDy4HEbO3_sYngpKCOBypLINsBg63JScc3LvPCy9hsCDd7nn_VqyoKu88Kg1OOcjIW7pvQVd4zwt2AReEcS14j_k'

const quoteAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8mdRIH2M-OkmFfphO8eTTBRfo7yjYko-zqovKzPl01_KzVHr8wnPcbUoCZC-qOYptBikwSdLpij61nqaw7AGn1t5aLaYqO4PNzgR_sjEBrGW8G0UAVy6s8Tq3gyM33pE6ymiQgBuXMZw9WV7o5PfcFMUBGh-1xHhAsbaKI0V7P46-KaYwnb6wg0p32jKlIdY4FBhQq-d0Sg7k8W7EAW4LNj_3JHQwOR407_kzChWRoQ-KQBhkNc-qvqXbBbEtv1GwrY_G5O_Sb2_X'

export function LandingPageScreen() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <nav className="fixed top-0 z-50 flex h-20 w-full items-center justify-between bg-[#f7f9fb]/80 px-8 shadow-[0_20px_40px_rgba(25,28,30,0.06)] backdrop-blur-xl transition-opacity duration-300 dark:bg-[#191c1e]/80">
        <div className="flex items-center gap-12">
          <Link
            to="/landing"
            className="font-headline text-xl font-bold tracking-tighter text-[#191c1e] dark:text-[#f7f9fb]"
          >
            The Wired Studio
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {['Features', 'Showcase', 'Pricing', 'About'].map((label) => (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="font-headline font-bold tracking-tight text-on-surface-variant transition-colors hover:text-on-surface"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            to="/"
            className="hidden text-sm font-medium text-on-surface-variant hover:text-primary sm:inline"
          >
            Demos
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Toggle theme"
          >
            <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size="sm" />
          </button>
          <Link
            to="/login"
            className="font-headline font-bold tracking-tight text-primary transition-opacity hover:opacity-80 dark:text-primary-fixed-dim"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="primary-gradient rounded-md px-6 py-2.5 font-headline font-bold tracking-tight text-white transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="pt-20">
        <section className="relative flex min-h-[921px] flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div className="z-10 max-w-5xl">
            <h1 className="mb-8 font-headline text-6xl font-extrabold leading-[1.05] tracking-tight text-on-surface md:text-8xl">
              The Infinite Canvas for <span className="italic text-primary">Collaborative</span> Minds.
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-xl font-light leading-relaxed text-on-surface-variant md:text-2xl">
              Designed for curators, creators, and visionaries. An editorial experience for modern teamwork,
              where tools disappear and ideas take center stage.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="primary-gradient rounded-md px-10 py-4 font-headline text-lg font-bold text-white transition-transform hover:scale-[1.02]"
              >
                Start Designing Now
              </Link>
              <button
                type="button"
                className="rounded-md bg-surface-container-high px-10 py-4 font-headline text-lg font-bold text-primary transition-colors hover:bg-surface-container-highest"
              >
                Watch the Showcase
              </button>
            </div>
          </div>
          <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-secondary-container/10 blur-[120px]" />
        </section>

        <section className="mx-auto max-w-[1400px] px-8 py-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="group relative min-h-[500px] overflow-hidden rounded-xl bg-surface-container-low md:col-span-8">
              <div className="p-12">
                <span className="mb-4 inline-block rounded bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  Core Engine
                </span>
                <h3 className="mb-4 font-headline text-4xl font-bold">Fluid Collaboration</h3>
                <p className="max-w-md text-on-surface-variant">
                  Experience zero-latency cursor tracking. Feel the presence of your team as if they were in
                  the same room.
                </p>
              </div>
              <div className="absolute inset-0 left-1/4 top-1/2 translate-y-12">
                <img
                  src={heroImg}
                  alt=""
                  className="h-full w-full rounded-tl-xl object-cover shadow-2xl transition-transform duration-700 group-hover:-translate-y-4"
                />
              </div>
            </div>

            <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-primary p-12 text-white md:col-span-4">
              <div className="z-10">
                <h3 className="mb-4 font-headline text-3xl font-bold">Infinite Context</h3>
                <p className="text-white/80">
                  Annotate anything with smart sticky notes that evolve with your project structure.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 h-48 w-48 rotate-12 rounded-xl bg-white/10 backdrop-blur-sm" />
              <div className="absolute bottom-10 right-10 flex h-48 w-48 -rotate-6 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                <Icon name="sticky_note_2" className="text-4xl text-white" />
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-surface-container-highest p-12 md:col-span-4">
              <div>
                <h3 className="mb-4 font-headline text-3xl font-bold">Precision Ink</h3>
                <p className="text-on-surface-variant">
                  Vector-perfect drawing tools that feel natural. From sketches to high-fidelity wireframes.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-on-surface text-surface">
                  <Icon name="edit" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-on-surface-variant">
                  <Icon name="brush" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-on-surface-variant">
                  <Icon name="gesture" />
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-surface-container-low md:col-span-8">
              <img
                src={showcaseImg}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-20 grayscale"
              />
              <div className="z-10 px-12 text-center">
                <p className="mb-8 font-headline text-2xl font-bold">
                  Trusted by the world&apos;s most innovative design studios.
                </p>
                <div className="flex flex-wrap justify-center gap-12 opacity-60">
                  {['SPATIAL', 'MODULAR', 'ETHER', 'VERTEX'].map((name) => (
                    <span key={name} className="font-headline text-xl font-extrabold tracking-tighter">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-32 px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Icon name="format_quote" filled className="mb-8 text-5xl text-primary" />
            <blockquote className="mb-10 font-headline text-3xl font-bold leading-tight text-on-surface md:text-4xl">
              &quot;The Wired Studio isn&apos;t just a tool; it&apos;s the air we breathe. It removed the
              friction between thought and execution, allowing our team to curate experiences that truly
              matter.&quot;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-surface-variant">
                <img src={quoteAvatar} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="text-left">
                <p className="font-bold text-on-surface">Julian Thorne</p>
                <p className="text-sm text-on-surface-variant">Design Director at Spatial</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center px-8 py-32">
          <div className="relative w-full max-w-6xl overflow-hidden rounded-xl bg-on-surface p-16 text-center text-surface-container-lowest md:p-24">
            <div className="relative z-10">
              <h2 className="mb-8 font-headline text-5xl font-extrabold tracking-tighter md:text-7xl">
                Ready to fade into focus?
              </h2>
              <p className="mx-auto mb-12 max-w-xl text-xl text-surface-variant/60">
                Join 10,000+ teams using the shared canvas to build the future.
              </p>
              <Link
                to="/signup"
                className="primary-gradient inline-block rounded-md px-12 py-5 font-headline text-lg font-bold text-white transition-transform hover:scale-105"
              >
                Get Started for Free
              </Link>
              <p className="mt-6 font-label text-sm uppercase tracking-widest text-surface-variant/40">
                No credit card required. Cancel anytime.
              </p>
            </div>
            <div className="absolute -right-1/4 -top-1/2 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
          </div>
        </section>
      </main>

      <footer className="grid w-full grid-cols-1 items-end gap-8 bg-[#f2f4f6] px-8 py-12 dark:bg-[#191c1e] md:grid-cols-2 lg:flex lg:justify-between">
        <div className="flex flex-col gap-4">
          <span className="font-sans text-sm uppercase tracking-widest text-primary dark:text-primary-fixed-dim">
            © 2024 The Wired Studio. Designed for Curators.
          </span>
          <div className="flex gap-6">
            <a href="#" className="font-sans text-sm uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="font-sans text-sm uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary">
              Terms of Service
            </a>
          </div>
        </div>
        <div className="flex gap-8">
          {['Twitter', 'LinkedIn', 'Help Center'].map((label) => (
            <a
              key={label}
              href="#"
              className="font-sans text-sm uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            >
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
