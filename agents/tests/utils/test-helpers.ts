import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

export function createMockRequest(options: any = {}): IncomingMessage {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  
  Object.assign(req, {
    method: 'GET',
    url: '/',
    headers: {},
    ...options
  });
  
  return req;
}

export function createMockResponse(): ServerResponse & {
  statusCode: number;
  data: any;
  headers: Record<string, string>;
} {
  const res = new ServerResponse(createMockRequest()) as any;
  
  res.statusCode = 200;
  res.data = null;
  res.headers = {};
  
  res.writeHead = function(statusCode: number, headers?: any) {
    res.statusCode = statusCode;
    if (headers) {
      res.headers = { ...res.headers, ...headers };
    }
    return res;
  };
  
  res.setHeader = function(name: string, value: string) {
    res.headers[name] = value;
    return res;
  };
  
  res.write = function(data: any) {
    res.data = data;
    return true;
  };
  
  res.end = function(data?: any) {
    if (data) {
      res.data = data;
    }
    return res;
  };
  
  return res;
}

export function createMockWebSocket() {
  return {
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    emit: vi.fn(),
    readyState: 1
  };
}

export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createTestAgent(AgentClass: any, config: any) {
  const agent = new AgentClass(config);
  
  // Mock external dependencies
  agent.httpClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  };
  
  agent.logger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  };
  
  return agent;
}

export function mockDate(date: Date | string) {
  const mockDate = new Date(date);
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);
  return () => vi.useRealTimers();
}

export async function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}
