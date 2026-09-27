import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

export interface ErrorBoundaryProps {
  children: ReactNode
  title?: string
}

interface ErrorBoundaryState {
  message: string | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { message: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { message: error instanceof Error ? error.message : String(error) }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary поймал ошибку:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ message: null })
  }

  render() {
    const { message } = this.state
    if (!message) return this.props.children

    return (
      <div className={styles.wrapper} role="alert">
        <div className={styles.card}>
          <h1 className={styles.title}>{this.props.title ?? 'Что-то пошло не так'}</h1>
          <p className={styles.message}>{message}</p>
          <button className={styles.retry} type="button" onClick={this.handleRetry}>
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
