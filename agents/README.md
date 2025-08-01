# ALTAMEDICA MCP Agents

This directory contains the Model Context Protocol (MCP) agents that provide specialized functionality across the ALTAMEDICA platform. Each agent is responsible for a specific domain and can be communicated with by microservices.

## Agent Architecture

### 1. AuthAgent
**Purpose**: Manages shared token logic, rotation, revocation, and authentication state.

**Responsibilities**:
- JWT token creation and verification
- Token rotation and refresh
- Session management
- Authentication state synchronization across services
- Security audit logging

**Configuration**:
- JWT secrets and algorithms
- Token expiration times
- Refresh token policies
- Session duration limits

**Communication**: HTTP API and WebSocket for real-time auth events
**Port**: 3001

### 2. RoutingAgent
**Purpose**: Determines correct dashboard URLs and handles deep links based on user context.

**Responsibilities**:
- User type-based routing logic
- Deep link resolution
- URL generation for cross-service navigation
- Route validation and access control
- Redirect handling

**Configuration**:
- Service port mappings
- Domain configurations
- Route patterns
- Access rules

**Communication**: HTTP API for routing decisions
**Port**: 3002

### 3. SecurityAgent
**Purpose**: Enforces middleware, CORS, rate limiting, and CSRF protection across services.

**Responsibilities**:
- CORS policy enforcement
- Rate limiting rules
- CSRF token management
- Security header injection
- Vulnerability scanning
- Security policy updates

**Configuration**:
- CORS origins and policies
- Rate limiting thresholds
- Security headers
- Allowed origins and methods

**Communication**: Middleware integration and policy API
**Port**: 3006

### 4. MonitoringAgent
**Purpose**: Aggregates logs, metrics, and alerts for anomaly detection.

**Responsibilities**:
- Log aggregation from all services
- Metrics collection and analysis
- Anomaly detection algorithms
- Alert generation and routing
- Performance monitoring
- Health check coordination

**Configuration**:
- Log levels and destinations
- Metric collection intervals
- Alert thresholds
- Notification channels

**Communication**: Log streaming, metrics API, and alert webhooks
**Port**: 3007

### 5. DevOpsAgent
**Purpose**: Automates builds, runs tests, and handles deployments via CI/CD.

**Responsibilities**:
- Build automation
- Test execution and reporting
- Deployment orchestration
- Environment management
- Configuration deployment
- Rollback handling

**Configuration**:
- Build pipelines
- Test suites
- Deployment targets
- Environment variables

**Communication**: CI/CD webhooks and deployment API
**Port**: 3008

## Microservice Communication with Agents

### Authentication Flow
```
Microservice -\u003e AuthAgent
1. POST /auth/login (credentials)
2. POST /auth/verify (token validation)
3. POST /auth/refresh (token refresh)
4. WebSocket for real-time auth events
```

### Routing Flow
```
Microservice -\u003e RoutingAgent
1. POST /routing/resolve (path resolution)
2. POST /routing/generate-url (URL generation)
3. POST /routing/dashboard (user-specific routing)
4. GET /routing/health (service health)
```

### Security Flow
```
Microservice -\u003e SecurityAgent
1. Middleware integration for CORS
2. Rate limiting enforcement
3. CSRF token validation
4. Security header injection
```

### Monitoring Flow
```
Microservice -\u003e MonitoringAgent
1. POST /monitoring/logs (log submission)
2. POST /monitoring/metrics (metric submission)
3. WebSocket for real-time monitoring
4. GET /monitoring/dashboard (dashboard data)
```

### DevOps Flow
```
Microservice -\u003e DevOpsAgent
1. POST /devops/build (trigger build)
2. POST /devops/deploy (trigger deployment)
3. Webhook integration for CI/CD
4. GET /devops/builds (build status)
```

## Agent Communication Patterns

### Service-to-Agent Communication
Each microservice communicates with agents through well-defined interfaces:

1. **HTTP APIs**: For request-response patterns
2. **WebSockets**: For real-time events and streaming
3. **Message Queues**: For asynchronous operations
4. **gRPC**: For high-performance internal communication

### Agent-to-Agent Communication
Agents can coordinate with each other when needed:

- AuthAgent ↔ SecurityAgent: Security policy updates
- MonitoringAgent ↔ DevOpsAgent: Deployment health checks
- RoutingAgent ↔ AuthAgent: Access control decisions

### Configuration Management
Each agent maintains its configuration through:

- Environment variables
- Configuration files (JSON)
- Dynamic configuration APIs
- Secrets management integration

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Docker (for containerized deployment)

### Installation
1. Install dependencies:
```bash
cd agents
npm install
```

2. Configure agents:
```bash
# Copy example configurations
cp config/auth-agent.json config/auth-agent.local.json
cp config/routing-agent.json config/routing-agent.local.json
cp config/security-agent.json config/security-agent.local.json
cp config/monitoring-agent.json config/monitoring-agent.local.json
cp config/devops-agent.json config/devops-agent.local.json

# Edit configurations with your values
```

### Running Agents

#### Start All Agents
```bash
npm run start:all
# or
node start-all-agents.js
```

#### Start Individual Agents
```bash
# Auth Agent
npm run start:auth

# Routing Agent
npm run start:routing

# Security Agent
npm run start:security

# Monitoring Agent
npm run start:monitoring

# DevOps Agent
npm run start:devops
```

### Health Checks

All agents expose health check endpoints:
- `GET /health` - Basic health status
- `GET /health/detailed` - Detailed health information
- `GET /metrics` - Prometheus-compatible metrics

### Agent Endpoints

| Agent | Port | Health Check | Purpose |
|-------|------|--------------|---------|
| AuthAgent | 3001 | http://localhost:3001/health | Authentication \u0026 Authorization |
| RoutingAgent | 3002 | http://localhost:3002/health | URL Routing \u0026 Deep Links |
| SecurityAgent | 3006 | http://localhost:3006/health | Security Middleware |
| MonitoringAgent | 3007 | http://localhost:3007/health | Logging \u0026 Metrics |
| DevOpsAgent | 3008 | http://localhost:3008/health | CI/CD \u0026 Deployments |

## Development Guidelines

### Creating New Agents
1. Follow the agent template structure in `src/shared/BaseAgent.ts`
2. Implement health check endpoints
3. Add configuration schema validation
4. Include comprehensive logging
5. Write unit and integration tests

### Agent Best Practices
- Use structured logging (JSON format)
- Implement graceful shutdown
- Handle errors appropriately
- Use circuit breakers for external calls
- Implement proper security measures

### Testing
- Unit tests for business logic
- Integration tests for agent communication
- End-to-end tests for critical workflows
- Performance tests for high-load scenarios

## Monitoring and Observability

### Logging
- Structured JSON logs
- Centralized log aggregation
- Log level configuration
- Sensitive data redaction

### Metrics
- Prometheus metrics exposition
- Custom business metrics
- Performance counters
- Error rates and latencies

### Tracing
- Distributed tracing support
- Request correlation IDs
- Performance bottleneck identification

## Security Considerations

### Authentication
- Mutual TLS for agent communication
- API key authentication for external access
- JWT tokens for service authentication

### Authorization
- Role-based access control
- Agent-specific permissions
- Audit logging for sensitive operations

### Network Security
- Network policies and firewalls
- Encrypted communication
- VPN or service mesh for production

## Deployment Architecture

### Development Environment
- Agents run as separate Node.js processes
- Configuration through local files
- Direct HTTP communication between services

### Production Environment
- Agents deployed as containerized services
- Service mesh for communication
- Centralized configuration management
- Load balancing and high availability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Follow code review process

## Support

For questions and support:
- Technical documentation: `/docs/agents/`
- Issue tracking: GitHub Issues
- Team communication: Internal Slack channels

