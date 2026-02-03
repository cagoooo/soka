import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReload = () => {
        // Clear all caches and reload
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => registration.unregister());
            });
        }
        caches.keys().then((names) => {
            names.forEach((name) => {
                caches.delete(name);
            });
        });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                    background: '#f8fafc'
                }}>
                    <h2 style={{ color: '#334155', marginBottom: '10px' }}>系統已更新</h2>
                    <p style={{ color: '#64748b', marginBottom: '20px' }}>我們發布了新版本，請點擊下方按鈕以載入最新內容。</p>
                    <button
                        onClick={this.handleReload}
                        style={{
                            padding: '12px 24px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
                        }}
                    >
                        🔄 重新載入 (Update)
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
