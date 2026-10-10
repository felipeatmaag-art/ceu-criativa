import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="rounded-3xl border border-red-200 bg-red-50/60 p-8 text-center my-6 space-y-3">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-red-900">
            {this.props.title || 'Não foi possível carregar este conteúdo'}
          </h3>
          <p className="text-xs text-red-700 max-w-md mx-auto">
            {this.state.error?.message || 'Ocorreu uma falha inesperada ao exibir as informações.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="rounded-xl border-red-300 text-red-700 hover:bg-red-100 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Tentar Recarregar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
