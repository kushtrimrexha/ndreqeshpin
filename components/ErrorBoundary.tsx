'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          gap: 16,
          padding: 32,
          background: 'rgba(239,68,68,0.05)',
          borderRadius: 16,
          border: '1px solid rgba(239,68,68,0.15)',
          margin: 16,
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>
              Diçka shkoi keq
            </p>
            <p style={{ color: 'rgba(232,234,240,0.5)', fontSize: 13, margin: 0 }}>
              {this.state.error?.message || 'Gabim i papritur. Provo të rifreskosh faqen.'}
            </p>
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            🔄 Rifresko
          </button>
        </div>
      )
    }

    return this.props.children
  }
}