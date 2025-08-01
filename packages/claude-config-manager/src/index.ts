// Claude Config Manager
// Gestión de configuraciones para Claude AI

export interface ClaudeConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class ClaudeConfigManager {
  private config: ClaudeConfig = {};

  constructor(initialConfig?: ClaudeConfig) {
    if (initialConfig) {
      this.config = { ...initialConfig };
    }
  }

  setConfig(config: Partial<ClaudeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): ClaudeConfig {
    return { ...this.config };
  }

  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  getModel(): string {
    return this.config.model || 'claude-3-sonnet-20240229';
  }

  getMaxTokens(): number {
    return this.config.maxTokens || 4096;
  }

  getTemperature(): number {
    return this.config.temperature || 0.7;
  }
}

export default ClaudeConfigManager;