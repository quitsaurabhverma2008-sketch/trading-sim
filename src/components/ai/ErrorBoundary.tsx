"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
          <p className="text-sm font-medium mb-1">Something went wrong</p>
          <p className="text-xs text-muted-foreground mb-3 max-w-[300px]">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
