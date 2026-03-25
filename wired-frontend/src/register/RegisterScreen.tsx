import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { useRegisterScreenUseCase } from './useRegisterScreenUseCase';

const heroImg =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBG2ZLw2OTtfYozzgAMkZIt73sdz5Bk7Xg7rI6S0PxnYW6BN66g5aDLrm9r9BP6IlQxKbZp1WrD6P2FpKjFgK3KkgInez6Dzep41cPEZP4CsFuR-HhMsiTWiMyJoBstGedIC6F-leDt-KuiyAwv00xbvaEM2Luq5AOuG5lVR-a2HNauHAyvU8Rm_CDwJaCtrey2nsrpP1P69BNV39SD-tPrKq7w7ddBbDwYCAlO1PXrgAnLMv6ChcJ40oGZkQvisvYCGM8q9ukChDnx';

const googleLogo =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBjDyB8yAOaqguLk8nNFtesr34AqArR-dEmWyBrLaei_1EkT7JbMrmVkHkRM0FGZz8sbjz50pTtJjz5SnObl5kDBn_gkTLUkaFs8ewZqgzIF0aFID4fHhOX3-y67im2M7uqHZA9PhFye99Mz42VyAT_HP3tx_24UDbPMdvbulTPBQuvQW9CuZobU54iOr7NNQ1-taoPLstxWv_5g-QkFNvlyYp0OKmyduiWQ3HpIQ3DsyBiXUYrU03sn_D6aWRMZjmvTVQ9Urynu-iq';

export default function RegisterScreen() {
  const { error, showPassword, togglePasswordVisibility, isPending, handleSubmit } = useRegisterScreenUseCase();

  return (
    <div className="overflow-x-hidden bg-surface font-body text-on-surface antialiased">
      <header className="glass-panel fixed top-0 z-50 flex h-16 w-full items-center px-6 md:hidden">
        <Link to="/landing" className="font-headline text-lg font-bold tracking-tighter text-on-surface">
          The Wired Studio
        </Link>
      </header>

      <main className="flex min-h-screen flex-col md:flex-row">
        <section className="relative hidden min-h-screen w-1/2 items-center justify-center overflow-hidden bg-surface-container-low p-12 lg:w-3/5 md:flex lg:p-24">
          <div className="absolute inset-0 z-0">
            <img
              src={heroImg}
              alt=""
              className="h-full w-full object-cover opacity-60 mix-blend-multiply grayscale filter"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-surface via-transparent to-transparent" />
          </div>
          <span className="absolute left-12 top-12 z-20 font-headline text-xl font-bold tracking-tighter text-on-surface">
            The Wired Studio
          </span>
          <div className="relative z-10 max-w-xl">
            <div className="mb-8">
              <span className="mb-4 inline-block bg-primary-container/10 px-3 py-1 font-label text-xs uppercase tracking-widest text-primary">
                The Curator&apos;s Space
              </span>
              <h1 className="font-headline text-5xl font-extrabold leading-[0.95] tracking-tighter text-on-surface lg:text-7xl">
                Where Vision <br />
                Becomes <br />
                Visible.
              </h1>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="font-headline text-2xl font-bold text-primary">01</p>
                <p className="text-sm font-medium text-on-surface-variant">
                  Design with the speed of thought in our immersive studio environment.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-headline text-2xl font-bold text-primary">02</p>
                <p className="text-sm font-medium text-on-surface-variant">
                  Collaborate across borders with zero latency in high-fidelity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col items-center justify-center bg-surface px-6 pb-12 pt-24 md:px-12 md:py-12 lg:px-20">
          <div className="w-full max-w-md space-y-10">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Create your account</h2>
              <p className="text-sm text-on-surface-variant">
                Start your journey into the editorial digital experience.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="full_name"
                  className="block font-label text-xs uppercase tracking-widest text-on-surface-variant"
                >
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Evelyn Harper"
                  autoComplete="name"
                  className="w-full rounded-md border-none bg-surface-container-highest px-4 py-4 text-on-surface outline-none transition-all duration-300 placeholder:text-outline focus:bg-surface-container-lowest focus:ring-0"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="signup-email"
                  className="block font-label text-xs uppercase tracking-widest text-on-surface-variant"
                >
                  Work Email
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="curator@thewired.studio"
                  autoComplete="email"
                  className="w-full rounded-md border-none bg-surface-container-highest px-4 py-4 text-on-surface outline-none transition-all duration-300 placeholder:text-outline focus:bg-surface-container-lowest focus:ring-0"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="signup-password"
                  className="block font-label text-xs uppercase tracking-widest text-on-surface-variant"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-md border-none bg-surface-container-highest px-4 py-4 pr-12 text-on-surface outline-none transition-all duration-300 placeholder:text-outline focus:bg-surface-container-lowest focus:ring-0"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-xl" />
                  </button>
                </div>
                <p className="pt-1 text-[10px] text-outline">Must be at least 12 characters with one special symbol.</p>
              </div>

              <div className="flex items-start gap-3 py-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded-sm border-outline-variant bg-surface-container-highest text-primary focus:ring-primary/20"
                />
                <label htmlFor="terms" className="text-xs leading-tight text-on-surface-variant">
                  I agree to the{' '}
                  <a href="#" className="text-primary transition-all hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary transition-all hover:underline">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="editorial-gradient w-full rounded-md py-4 font-headline font-bold text-white shadow-[0_20px_40px_rgba(0,67,200,0.15)] transition-opacity duration-300 hover:opacity-90"
              >
                {isPending ? 'Creating account...' : 'Get Started'}
              </button>
              {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
            </form>

            <div className="space-y-6">
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-surface-container-high" />
                <span className="mx-4 flex-shrink font-label text-xs uppercase tracking-widest text-outline">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-surface-container-high" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md bg-surface-container-low py-3 px-4 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  <img src={googleLogo} alt="" className="h-4 w-4" />
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md bg-surface-container-low py-3 px-4 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  <Icon name="terminal" className="text-lg" />
                  GitHub
                </button>
              </div>
            </div>

            <p className="pt-8 text-center text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="ml-1 font-bold text-primary transition-all hover:underline">
                Sign In
              </Link>
            </p>

            <footer className="mt-auto w-full max-w-md pt-12">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <a
                  href="#"
                  className="font-label text-[10px] uppercase tracking-widest text-outline transition-colors hover:text-primary"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="font-label text-[10px] uppercase tracking-widest text-outline transition-colors hover:text-primary"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="font-label text-[10px] uppercase tracking-widest text-outline transition-colors hover:text-primary"
                >
                  Help Center
                </a>
              </div>
              <p className="mt-4 text-center font-label text-[10px] uppercase tracking-tighter text-outline">
                © 2024 The Wired Studio. Designed for Curators.
              </p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
