# SchedulingOptimizationAgent

A sophisticated healthcare scheduling optimization agent that uses constraint-solving (OptaPlanner) and ML demand forecasting to optimize staff rosters, appointment slots, and room/equipment utilization.

## Features

### Core Capabilities
- **Constraint-based Scheduling**: Uses OptaPlanner for complex constraint solving
- **Demand Forecasting**: ML-powered prediction of appointment demand
- **Real-time Updates**: WebSocket support for live schedule updates
- **Multi-resource Optimization**: Optimizes staff, rooms, and equipment simultaneously
- **Flexible Constraints**: Support for both hard and soft constraints

### REST API Endpoints

#### Schedule Optimization
- `POST /api/v1/schedule/optimize` - Start schedule optimization
- `GET /api/v1/schedule/optimize/:id` - Get optimization status
- `GET /api/v1/schedule/current` - Get current schedule

#### Appointment Management
- `POST /api/v1/appointments/book` - Book an appointment with optimal slot finding
- `GET /api/v1/forecast/demand` - Get demand forecasts

#### Resource Management
- `GET /api/v1/roster/:staffId` - Get staff roster
- `GET /api/v1/rooms/utilization` - Get room utilization statistics

#### Constraint Management
- `GET /api/v1/constraints` - List all scheduling constraints
- `POST /api/v1/constraints` - Add new constraint

### WebSocket Events
- `appointment_booked` - New appointment added
- `optimization_completed` - Schedule optimization finished
- `schedule_updated` - Real-time schedule changes

## Architecture

The agent consists of two main components:

### 1. TypeScript Agent (Node.js)
- Handles REST API endpoints
- Manages WebSocket connections
- Communicates with OptaPlanner service
- Integrates with ML service for demand forecasting

### 2. OptaPlanner Service (Java/Spring Boot)
- Performs constraint-based optimization
- Manages scheduling domain model
- Provides optimization algorithms

## Installation

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- Redis (optional, for caching)
- Kafka (optional, for event streaming)

### Setup TypeScript Agent

```bash
# Install dependencies
cd agents
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start the agent
pnpm tsx src/scheduling-optimization-agent/start.ts
```

### Setup OptaPlanner Service

```bash
# Build the service
cd optaplanner-service
mvn clean package

# Run the service
java -jar target/optaplanner-scheduling-service-1.0.0.jar
```

## Configuration

### TypeScript Agent Configuration

```typescript
{
  port: 3010,
  host: '0.0.0.0',
  name: 'SchedulingOptimizationAgent',
  logLevel: 'info',
  corsOrigins: ['http://localhost:3000'],
  enableWebSocket: true,
  enableMetrics: true,
  healthCheckInterval: 30000,
  optaplannerServiceUrl: 'http://localhost:8080',
  mlServiceUrl: 'http://localhost:8081',
  redisHost: 'localhost',
  redisPort: 6379,
  kafkaBrokers: ['localhost:9092'],
  demandForecastingEnabled: true
}
```

### Environment Variables

```bash
# TypeScript Agent
SCHEDULING_AGENT_PORT=3010
SCHEDULING_AGENT_HOST=0.0.0.0
OPTAPLANNER_SERVICE_URL=http://localhost:8080
ML_SERVICE_URL=http://localhost:8081
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BROKERS=localhost:9092
ENABLE_DEMAND_FORECASTING=true
LOG_LEVEL=info

# OptaPlanner Service
SERVER_PORT=8080
DATABASE_URL=jdbc:postgresql://localhost:5432/scheduling
DATABASE_USER=postgres
DATABASE_PASSWORD=password
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BROKERS=localhost:9092
SOLVER_TIME_LIMIT=30s
ENABLE_DEMAND_FORECASTING=false
```

## Usage Examples

### Start Schedule Optimization

```bash
curl -X POST http://localhost:3010/api/v1/schedule/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-15",
    "endDate": "2024-01-21",
    "staff": [...],
    "appointments": [...],
    "rooms": [...],
    "constraints": [...]
  }'
```

### Book Appointment

```bash
curl -X POST http://localhost:3010/api/v1/appointments/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient123",
    "type": "consultation",
    "duration": 30,
    "requiredSkills": ["general_practice"],
    "priority": "medium"
  }'
```

### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:3010');

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'subscribe' }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received update:', message);
});
```

## Scheduling Constraints

### Hard Constraints (Must be satisfied)
- **Staff Skills Match**: Staff must have required skills for appointments
- **No Double Booking**: Prevent staff/room double bookings
- **Availability**: Staff and rooms must be available
- **Room Suitability**: Rooms must be suitable for appointment types
- **Urgent Priority**: Urgent appointments must be scheduled

### Soft Constraints (Optimized)
- **Minimize Wait Time**: Reduce patient waiting time
- **Maximize Utilization**: Optimize staff and room usage
- **Staff Preferences**: Respect shift preferences
- **Minimize Room Changes**: Reduce staff movement between rooms
- **Balance Workload**: Distribute appointments evenly
- **Preferred Hours**: Schedule within standard hours
- **Minimize Overtime**: Avoid staff overtime
- **Group Appointments**: Group related patient appointments

## Metrics and Monitoring

### Available Metrics
- `optimization_queue_size` - Number of pending optimizations
- `demand_forecasts_cached` - Number of cached forecasts
- `active_optimizations` - Currently processing optimizations
- `schedule_utilization_rate` - Overall schedule efficiency
- `average_wait_time` - Average patient wait time

### Health Checks
- `/health` - Basic health status
- `/health/detailed` - Detailed health with subsystem status
- `/metrics` - Prometheus-compatible metrics

## Integration

### With Other Agents
The SchedulingOptimizationAgent can integrate with:
- **PatientMonitoringAgent**: For emergency appointment scheduling
- **KnowledgeGraphAgent**: For staff skill matching
- **AuthAgent**: For access control and permissions

### Event Bus Integration
Publishes events:
- `schedule.optimized`
- `appointment.scheduled`
- `resource.allocated`

Subscribes to:
- `patient.emergency`
- `staff.availability.changed`
- `room.maintenance.scheduled`

## Development

### Adding New Constraints

1. Add constraint to `SchedulingConstraintProvider.java`:
```java
private Constraint myNewConstraint(ConstraintFactory factory) {
    return factory
        .forEach(Appointment.class)
        .filter(/* your condition */)
        .penalize(HardSoftScore.ONE_SOFT, /* weight */)
        .asConstraint("My new constraint");
}
```

2. Register in `defineConstraints()` method

### Adding New API Endpoints

1. Add endpoint to TypeScript agent:
```typescript
this.app.get('/api/v1/my-endpoint', async (req, res) => {
    // Implementation
});
```

2. Add corresponding controller method in Spring Boot service if needed

## Troubleshooting

### Common Issues

1. **OptaPlanner service not reachable**
   - Check if service is running on correct port
   - Verify network connectivity
   - Check firewall settings

2. **Optimization taking too long**
   - Adjust `SOLVER_TIME_LIMIT` environment variable
   - Reduce problem size (fewer appointments/resources)
   - Check constraint complexity

3. **WebSocket connection failures**
   - Verify CORS settings
   - Check WebSocket port availability
   - Review proxy/firewall configuration

## Performance Tuning

- **Solver Threads**: Set `SOLVER_THREADS` based on CPU cores
- **Time Limits**: Adjust `SOLVER_TIME_LIMIT` for quality vs speed
- **Cache Settings**: Configure Redis for better performance
- **Database Indexes**: Ensure proper indexes on frequently queried fields

## License

Proprietary - AltaMedica Healthcare System
