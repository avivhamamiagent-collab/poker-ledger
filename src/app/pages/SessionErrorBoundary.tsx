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
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
          <div className="font-semibold">אירעה שגיאה בטעינת המסך</div>
          <div className="mt-1">{this.state.error.message}</div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" onClick={() => window.location.reload()}>רענון</Button>
            <Button variant="ghost" onClick={() => navigator.clipboard.writeText(this.state.error?.stack || this.state.error?.message || '')}>העתק אבחון</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
