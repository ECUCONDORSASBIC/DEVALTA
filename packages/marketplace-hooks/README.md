# @altamedica/marketplace-hooks

Sistema central de comunicación B2C para el marketplace médico de AltaMedica. Este paquete proporciona hooks compartidos para la comunicación entre aplicaciones de empresas y doctores.

## 🚀 Características

- **Gestión de Empleos**: Búsqueda, filtrado y gestión de ofertas de trabajo médicas
- **Sistema de Aplicaciones**: Gestión completa del ciclo de aplicaciones laborales
- **Mensajería en Tiempo Real**: Chat integrado con WebSocket para comunicación directa
- **Analytics Avanzados**: Métricas detalladas del marketplace y rendimiento
- **Perfiles Empresariales**: Gestión completa de perfiles de empresas médicas
- **Perfiles de Doctores**: Sistema completo de perfiles profesionales médicos
- **Notificaciones**: Sistema de notificaciones en tiempo real
- **Estado Global**: Gestión de estado compartido con Zustand

## 📦 Instalación

```bash
pnpm add @altamedica/marketplace-hooks
```

### Dependencias Peer

```json
{
  "react": "^18.0.0",
  "react-query": "^3.39.0",
  "zustand": "^4.0.0"
}
```

## 🛠 Configuración

### 1. Configurar React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Tu aplicación */}
    </QueryClientProvider>
  );
}
```

### 2. Configurar WebSocket (Opcional)

```typescript
import { useMarketplaceMessaging } from '@altamedica/marketplace-hooks';

function MessagingComponent() {
  const { connectWebSocket, disconnect } = useMarketplaceMessaging();

  useEffect(() => {
    connectWebSocket('wss://tu-websocket-url');
    return () => disconnect();
  }, []);
}
```

## 📚 Hooks Principales

### useMarketplaceJobs

Gestión completa de empleos del marketplace.

```typescript
import { useMarketplaceJobs } from '@altamedica/marketplace-hooks';

function JobsPage() {
  const {
    jobs,
    isLoading,
    searchJobs,
    filters,
    setFilters,
    bookmarkJob,
    shareJob
  } = useMarketplaceJobs({
    initialFilters: {
      specialization: 'Cardiología',
      location: 'Madrid'
    }
  });

  return (
    <div>
      {jobs?.map(job => (
        <JobCard
          key={job.id}
          job={job}
          onBookmark={() => bookmarkJob(job.id)}
          onShare={() => shareJob(job.id)}
        />
      ))}
    </div>
  );
}
```

### useJobApplications

Sistema completo de gestión de aplicaciones.

```typescript
import { useJobApplications } from '@altamedica/marketplace-hooks';

function ApplicationsPage() {
  const {
    applications,
    submitApplication,
    updateApplicationStatus,
    scheduleInterview,
    sendMessage
  } = useJobApplications('doctor-123');

  const handleApply = async (jobId: string) => {
    await submitApplication({
      jobId,
      coverLetter: 'Mi carta de presentación...',
      attachments: ['cv.pdf']
    });
  };

  return (
    <div>
      {applications?.map(app => (
        <ApplicationCard
          key={app.id}
          application={app}
          onStatusChange={updateApplicationStatus}
        />
      ))}
    </div>
  );
}
```

### useMarketplaceMessaging

Mensajería en tiempo real con WebSocket.

```typescript
import { useMarketplaceMessaging } from '@altamedica/marketplace-hooks';

function MessagingPage() {
  const {
    conversations,
    activeConversation,
    messages,
    sendMessage,
    markAsRead,
    isTyping,
    onlineUsers
  } = useMarketplaceMessaging();

  const handleSendMessage = async (content: string) => {
    if (activeConversation) {
      await sendMessage(activeConversation.id, {
        content,
        type: 'text'
      });
    }
  };

  return (
    <div className="messaging-interface">
      <ConversationsList conversations={conversations} />
      <MessageArea
        messages={messages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
      />
    </div>
  );
}
```

### useMarketplaceAnalytics

Analytics completos del marketplace.

```typescript
import { useMarketplaceAnalytics } from '@altamedica/marketplace-hooks';

function AnalyticsPage() {
  const {
    jobMetrics,
    applicationMetrics,
    messagingMetrics,
    marketTrends,
    refreshMetrics
  } = useMarketplaceAnalytics('company-123');

  return (
    <div>
      <MetricsCard title="Empleos Publicados" value={jobMetrics?.totalJobs} />
      <MetricsCard title="Aplicaciones Recibidas" value={applicationMetrics?.totalApplications} />
      <TrendsChart data={marketTrends} />
    </div>
  );
}
```

### useCompanyProfile

Gestión completa de perfiles empresariales.

```typescript
import { useCompanyProfile } from '@altamedica/marketplace-hooks';

function CompanyProfilePage() {
  const {
    company,
    reviews,
    insights,
    updateProfile,
    followers
  } = useCompanyProfile('company-123');

  const handleUpdateProfile = async (updates) => {
    await updateProfile({
      description: 'Nueva descripción...',
      benefits: ['Seguro médico', 'Flexibilidad horaria']
    });
  };

  return (
    <div>
      <CompanyInfo company={company} />
      <CompanyReviews reviews={reviews} />
      <CompanyInsights insights={insights} />
    </div>
  );
}
```

### useDoctorProfile

Sistema completo de perfiles médicos profesionales.

```typescript
import { useDoctorProfile } from '@altamedica/marketplace-hooks';

function DoctorProfilePage() {
  const {
    doctor,
    applications,
    reviews,
    insights,
    updateProfile
  } = useDoctorProfile('doctor-123');

  return (
    <div>
      <DoctorInfo doctor={doctor} />
      <ApplicationsHistory applications={applications} />
      <ProfessionalReviews reviews={reviews} />
      <CareerInsights insights={insights} />
    </div>
  );
}
```

## 🎯 Tipos TypeScript

El paquete incluye tipos TypeScript completos:

```typescript
import type {
  MarketplaceJob,
  JobApplication,
  MarketplaceCompany,
  MarketplaceDoctor,
  MarketplaceMessage,
  MarketplaceConversation,
} from '@altamedica/marketplace-hooks';
```

## 🏪 Store Global

Estado compartido con Zustand:

```typescript
import { useMarketplaceStore, useMessagingStore } from '@altamedica/marketplace-hooks';

function SomeComponent() {
  const { currentUser, setCurrentUser } = useMarketplaceStore();
  const { unreadCount, notifications } = useMessagingStore();
}
```

## 🔧 Utilidades

Funciones de utilidad incluidas:

```typescript
import {
  formatSalary,
  calculateMatchScore,
  formatTimeAgo,
  generateNotification,
} from '@altamedica/marketplace-hooks';
```

## 🌐 API Mock

El paquete incluye APIs mock completas para desarrollo y testing:

- **Jobs API**: CRUD completo de empleos
- **Applications API**: Gestión de aplicaciones
- **Messaging API**: Sistema de mensajes
- **Analytics API**: Métricas y estadísticas
- **Profiles API**: Gestión de perfiles

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Tests con coverage
pnpm test:coverage

# Tests en modo watch
pnpm test:watch
```

## 📊 Performance

- **Lazy Loading**: Carga diferida de conversaciones y mensajes
- **Optimistic Updates**: Actualizaciones optimistas para mejor UX
- **Cache Inteligente**: Gestión automática de cache con React Query
- **WebSocket Reconnection**: Reconexión automática del WebSocket
- **Error Boundaries**: Manejo robusto de errores

## 🔄 Estado de Conexión

```typescript
const { isConnected, connectionStatus, lastSeen } = useMarketplaceMessaging();

// connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
```

## 🚨 Manejo de Errores

```typescript
const { error, retry, isError } = useMarketplaceJobs();

if (isError) {
  return <ErrorBoundary error={error} onRetry={retry} />;
}
```

## 📱 Responsive Design

Todos los hooks están optimizados para funcionar en dispositivos móviles y desktop.

## 🔐 Seguridad

- Validación de datos en tiempo real
- Sanitización de mensajes
- Protección contra XSS
- Rate limiting para APIs

## 📝 Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guías de contribución.

## 📄 Licencia

MIT License - ver [LICENSE](./LICENSE) para más detalles.

## 🆘 Soporte

Para reportar bugs o solicitar features:

- [Issues](https://github.com/altamedica/marketplace-hooks/issues)
- [Discussions](https://github.com/altamedica/marketplace-hooks/discussions)

---

**AltaMedica** - Conectando el talento médico con las mejores oportunidades 🏥✨
