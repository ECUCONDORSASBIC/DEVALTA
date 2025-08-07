/**
 * Network Debugger para interceptar y monitorear todas las requests
 * Se puede inyectar en cualquier página para debugging
 */

interface NetworkLog {
  timestamp: number;
  type: 'request' | 'response' | 'error' | 'redirect';
  method?: string;
  url: string;
  status?: number;
  headers?: Record<string, string>;
  body?: any;
  duration?: number;
}

interface AuthStateLog {
  timestamp: number;
  event: string;
  user?: any;
  profile?: any;
  error?: string;
  url: string;
}

class NetworkDebugger {
  private logs: NetworkLog[] = [];
  private authLogs: AuthStateLog[] = [];
  private startTime: number = Date.now();
  private originalFetch: any;
  private originalXHR: any;

  constructor() {
    this.interceptFetch();
    this.interceptXHR();
    this.interceptConsole();
    this.monitorURLChanges();
    this.setupVisualDebugger();
  }

  private interceptFetch() {
    this.originalFetch = window.fetch;
    
    window.fetch = async (...args: any[]) => {
      const [url, options] = args;
      const startTime = Date.now();
      
      this.addLog({
        timestamp: Date.now(),
        type: 'request',
        method: options?.method || 'GET',
        url: url.toString(),
        headers: options?.headers || {},
        body: options?.body
      });

      try {
        const response = await this.originalFetch(...args);
        
        this.addLog({
          timestamp: Date.now(),
          type: 'response',
          url: url.toString(),
          status: response.status,
          duration: Date.now() - startTime
        });

        return response;
      } catch (error) {
        this.addLog({
          timestamp: Date.now(),
          type: 'error',
          url: url.toString(),
          body: error,
          duration: Date.now() - startTime
        });
        throw error;
      }
    };
  }

  private interceptXHR() {
    this.originalXHR = window.XMLHttpRequest;
    
    const self = this;
    window.XMLHttpRequest = function() {
      const xhr = new self.originalXHR();
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      
      let method: string, url: string;
      
      xhr.open = function(m: string, u: string, ...rest: any[]) {
        method = m;
        url = u;
        return originalOpen.apply(this, [m, u, ...rest]);
      };
      
      xhr.send = function(body: any) {
        const startTime = Date.now();
        
        self.addLog({
          timestamp: Date.now(),
          type: 'request',
          method,
          url,
          body
        });
        
        xhr.addEventListener('load', () => {
          self.addLog({
            timestamp: Date.now(),
            type: 'response',
            url,
            status: xhr.status,
            duration: Date.now() - startTime
          });
        });
        
        xhr.addEventListener('error', () => {
          self.addLog({
            timestamp: Date.now(),
            type: 'error',
            url,
            duration: Date.now() - startTime
          });
        });
        
        return originalSend.apply(this, [body]);
      };
      
      return xhr;
    };
  }

  private interceptConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('[AuthContext]') || message.includes('[Firebase')) {
        this.addAuthLog({
          timestamp: Date.now(),
          event: 'log',
          url: window.location.href,
          error: message.includes('❌') ? message : undefined
        });
      }
      return originalLog.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      this.addAuthLog({
        timestamp: Date.now(),
        event: 'error',
        error: message,
        url: window.location.href
      });
      return originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      this.addAuthLog({
        timestamp: Date.now(),
        event: 'warning',
        error: message,
        url: window.location.href
      });
      return originalWarn.apply(console, args);
    };
  }

  private monitorURLChanges() {
    let currentUrl = window.location.href;
    
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        this.addAuthLog({
          timestamp: Date.now(),
          event: 'url_change',
          url: window.location.href
        });
        currentUrl = window.location.href;
      }
    }, 100);
  }

  private setupVisualDebugger() {
    // Crear panel de debugging visual
    const debugPanel = document.createElement('div');
    debugPanel.id = 'network-debugger-panel';
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      max-height: 500px;
      background: white;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display: flex; justify-between; align-items: center; margin-bottom: 10px;">
        <strong>🔍 Network Debugger</strong>
        <div>
          <button onclick="networkDebugger.exportLogs()" style="margin-right: 5px;">📤 Export</button>
          <button onclick="networkDebugger.clearLogs()">🗑️ Clear</button>
          <button onclick="this.parentElement.parentElement.parentElement.style.display='none'">❌</button>
        </div>
      </div>
    `;
    
    const logsContainer = document.createElement('div');
    logsContainer.id = 'network-debugger-logs';
    
    debugPanel.appendChild(header);
    debugPanel.appendChild(logsContainer);
    document.body.appendChild(debugPanel);
    
    // Actualizar logs cada segundo
    setInterval(() => this.updateVisualLogs(), 1000);
  }

  private updateVisualLogs() {
    const container = document.getElementById('network-debugger-logs');
    if (!container) return;
    
    const recentLogs = [...this.logs, ...this.authLogs]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
    
    container.innerHTML = recentLogs.map(log => {
      const time = new Date(log.timestamp).toLocaleTimeString();
      const relativeTime = ((Date.now() - log.timestamp) / 1000).toFixed(1);
      
      if ('type' in log) {
        // Network log
        const color = log.type === 'error' ? 'red' : 
                     log.type === 'request' ? 'blue' : 'green';
        return `<div style="color: ${color}; margin: 2px 0;">
          [${time}] ${log.method || ''} ${log.url} (${log.status || ''}) - ${relativeTime}s ago
        </div>`;
      } else {
        // Auth log
        const color = log.event === 'error' ? 'red' : 
                     log.event === 'warning' ? 'orange' : 'purple';
        return `<div style="color: ${color}; margin: 2px 0;">
          [${time}] ${log.event.toUpperCase()}: ${log.error?.substring(0, 50) || 'N/A'} - ${relativeTime}s ago
        </div>`;
      }
    }).join('');
  }

  private addLog(log: NetworkLog) {
    this.logs.push(log);
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-50);
    }
  }

  private addAuthLog(log: AuthStateLog) {
    this.authLogs.push(log);
    if (this.authLogs.length > 100) {
      this.authLogs = this.authLogs.slice(-50);
    }
  }

  public exportLogs() {
    const data = {
      networkLogs: this.logs,
      authLogs: this.authLogs,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public clearLogs() {
    this.logs = [];
    this.authLogs = [];
  }

  public getLogs() {
    return {
      network: this.logs,
      auth: this.authLogs
    };
  }
}

// Inicializar automáticamente si estamos en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).networkDebugger = new NetworkDebugger();
  console.log('🔍 Network Debugger inicializado. Usa networkDebugger.exportLogs() para exportar logs.');
}

export default NetworkDebugger;