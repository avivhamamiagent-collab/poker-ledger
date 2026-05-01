import * as React from 'react'

type State = { error: Error | null }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: (err: Error, reset: () => void) => React.ReactNode },
  State
> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof console !== 'undefined') {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, this.reset)
      return (
        <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-on-background">
          <div className="w-full max-w-lg space-y-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
            <h1 className="text-xl font-black text-red-100">משהו השתבש</h1>
            <p className="text-sm leading-6 text-red-100/90">
              נסה לרענן את הדף. אם זה ממשיך, צור קשר.
            </p>
            <pre className="overflow-x-auto rounded-xl bg-black/30 p-3 text-xs text-red-100/90">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={this.reset}
              className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-300/20"
            >
              נסה שוב
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
