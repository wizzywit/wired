import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/common/Icon'
import { useLoginMutation } from '../service'

const googleIcon =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAeH-yrrr87r-7Oxh_SulOx3THV5hvQYufjQiMdvSZe0sLo3F0j001plgLeZTstnVLgRcTNhdvaaWwHmgY5wUo9PG8Lf4TcthlYqg0V8HB8ICTg7OT_qUW3pu3JoSm6E3dwBle7JYOi1vyLcIGhGWT-J1vr6ZKjNEwrHxnXmJMW7WN-KAN9p1AMWrSAAkS72ddLwlIRkXhos-ezgxamL3p5CuGCca0Nd7JzIxSUCLitbLBhn2LtWB3rdcbnjcs7jxZfAz1qEo8gd-DS'

export function LoginScreen() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const loginMutation = useLoginMutation()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    try {
      await loginMutation.mutateAsync({ email, password })
      navigate('/canvas')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.')
    }
  }

  return (
    <div className="relative min-h-dvh bg-surface font-body text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="pointer-events-none fixed inset-0 infinite-grid" />

      <div className="fixed left-0 top-0 z-[100] h-[2px] w-1/3 bg-primary" aria-hidden />

      <main className="relative flex min-h-screen items-center justify-center p-6 md:p-12">
        <div className="z-10 w-full max-w-[440px]">
          <div className="mb-12 text-center">
            <Link to="/landing" className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface">
              The Wired Studio
            </Link>
            <p className="font-label mt-2 text-sm uppercase tracking-widest text-on-surface-variant">
              Access your curated space
            </p>
          </div>

          <div className="rounded-xl bg-surface/80 p-8 shadow-[0_20px_40px_rgba(25,28,30,0.06)] ring-1 ring-on-surface/[0.03] backdrop-blur-3xl md:p-10 dark:bg-surface/60">
            <div className="mb-8 grid grid-cols-1 gap-4">
              <button
                type="button"
                className="group flex items-center justify-center gap-3 rounded-md bg-surface-container-high py-3.5 px-6 transition-colors duration-300 hover:bg-surface-container-highest"
              >
                <img src={googleIcon} alt="" className="h-5 w-5 grayscale transition-all group-hover:grayscale-0" />
                <span className="text-sm font-medium text-on-surface">Continue with Google</span>
              </button>
              <button
                type="button"
                className="group flex items-center justify-center gap-3 rounded-md bg-surface-container-high py-3.5 px-6 transition-colors duration-300 hover:bg-surface-container-highest"
              >
                <Icon name="terminal" className="text-on-surface" />
                <span className="text-sm font-medium text-on-surface">Continue with GitHub</span>
              </button>
            </div>

            <div className="mb-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-outline-variant/15" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">or use email</span>
              <div className="h-px flex-1 bg-outline-variant/15" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="ml-1 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Work Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="curator@studio.com"
                  autoComplete="email"
                  className="h-12 w-full rounded-md border-none bg-surface-container-highest px-4 text-on-surface placeholder:text-outline/50 transition-all duration-300 focus:bg-surface-container-lowest focus:ring-0"
                />
              </div>
              <div className="space-y-1.5">
                <div className="ml-1 flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Password
                  </label>
                  <a href="#" className="text-[10px] font-bold uppercase tracking-wider text-primary transition-opacity hover:opacity-80">
                    Forgot?
                  </a>
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-12 w-full rounded-md border-none bg-surface-container-highest px-4 text-on-surface placeholder:text-outline/50 transition-all duration-300 focus:bg-surface-container-lowest focus:ring-0"
                />
              </div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="mt-4 flex h-14 w-full items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-container font-semibold text-on-primary shadow-lg shadow-primary/10 transition-all duration-300 ease-in-out hover:opacity-90"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign In to The Wired Studio'}
              </button>
              {error ? (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              ) : null}
            </form>

            <p className="mt-10 text-center text-sm text-on-surface-variant">
              New to the studio?{' '}
              <Link to="/signup" className="ml-1 font-semibold text-primary decoration-primary/30 underline-offset-4 hover:underline">
                Request Access
              </Link>
            </p>
          </div>

          <div className="mt-12 space-y-4 text-center">
            <div className="flex items-center justify-center gap-6">
              <a href="#" className="text-[10px] uppercase tracking-widest text-outline transition-colors hover:text-primary">
                Privacy Policy
              </a>
              <a href="#" className="text-[10px] uppercase tracking-widest text-outline transition-colors hover:text-primary">
                Terms of Service
              </a>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-outline/60">
              © 2024 The Wired Studio. Designed for Curators.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
