import * as React from 'react'
import { Button } from '../../components/ui/button'

export class SessionErrorBoundary extends React.Component<{ children: React.ReactNode }, { error?: Error }> {
  state: { error?: Error } = {}

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="font-semibold">Something went wrong</div>
          <div className="mt-1">{this.state.error.message}</div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" onClick={() => window.location.reload()}>Reload</Button>
            <Button variant="ghost" onClick={() => navigator.clipboard.writeText(this.state.error?.stack || this.state.error?.message || '')}>Copy diagnostics</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
