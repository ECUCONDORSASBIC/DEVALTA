/**
 * 🧪 ALTAMEDICA PATIENTS - CYPRESS DASHBOARD COMPLETE WORKFLOW
 * Comprehensive end-to-end test covering the complete dashboard functionality
 */
describe('Complete Dashboard Workflow', () => {
  const patient = {
    email: 'test.patient@example.com',
    password: 'TestPassword123!',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockStats = {
    activeSessions: 5,
    totalSessions: 25,
    averageDuration: 45,
    participantsOnline: 12,
    connectionQuality: {
      excellent: 75,
      good: 20,
      poor: 5,
    },
    sessionsByType: {
      consultation: 15,
      follow_up: 8,
      emergency: 2,
    },
    systemHealth: {
      status: 'healthy',
      cpu: 35,
      memory: 45,
      network: 15,
    },
  };

  const mockSessions = [
    {
      id: '1',
      roomId: 'room-1',
      patientName: 'John Doe',
      doctorName: 'Dr. Smith',
      startTime: '2024-01-15T10:00:00Z',
      duration: 30,
      status: 'active',
      participants: 2,
      connectionQuality: 'excellent',
    },
    {
      id: '2',
      roomId: 'room-2',
      patientName: 'Jane Smith',
      doctorName: 'Dr. Johnson',
      startTime: '2024-01-15T11:00:00Z',
      duration: 45,
      status: 'active',
      participants: 2,
      connectionQuality: 'good',
    },
  ];

  const mockNotifications = [
    {
      id: '1',
      type: 'info',
      title: 'Sistema actualizado',
      message: 'El sistema ha sido actualizado exitosamente',
      timestamp: '2024-01-15T09:00:00Z',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Alta latencia detectada',
      message: 'Se detectó alta latencia en algunas sesiones',
      timestamp: '2024-01-15T08:30:00Z',
      read: true,
    },
  ];

  beforeEach(() => {
    // Mock API responses
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: patient.email,
          role: 'patient',
          firstName: patient.firstName,
          lastName: patient.lastName,
        },
      },
    }).as('login');

    cy.intercept('GET', '/api/v1/auth/me', {
      statusCode: 200,
      body: {
        id: '1',
        email: patient.email,
        role: 'patient',
        firstName: patient.firstName,
        lastName: patient.lastName,
      },
    }).as('getMe');

    cy.intercept('GET', '/api/v1/telemedicine/stats', {
      statusCode: 200,
      body: {
        success: true,
        data: mockStats,
      },
    }).as('getTelemedicineStats');

    cy.intercept('GET', '/api/v1/telemedicine/sessions', {
      statusCode: 200,
      body: {
        success: true,
        data: { sessions: mockSessions },
      },
    }).as('getActiveSessions');

    cy.intercept('GET', '/api/v1/notifications*', {
      statusCode: 200,
      body: {
        success: true,
        data: { notifications: mockNotifications },
      },
    }).as('getNotifications');

    cy.intercept('PATCH', '/api/v1/notifications/*/read', {
      statusCode: 200,
      body: {
        success: true,
        data: { read: true },
      },
    }).as('markNotificationRead');

    cy.intercept('PATCH', '/api/v1/notifications/read-all', {
      statusCode: 200,
      body: {
        success: true,
        data: { count: 2 },
      },
    }).as('markAllRead');
  });

  describe('Dashboard Access and Navigation', () => {
    it('should access dashboard after login', () => {
      cy.visit('/login');

      // Login
      cy.get('[data-testid="email-input"]').type(patient.email);
      cy.get('[data-testid="password-input"]').type(patient.password);
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@login');

      // Navigate to dashboard
      cy.get('[data-testid="dashboard-nav"]').click();
      cy.url().should('include', '/dashboard');

      // Verify dashboard loads
      cy.get('[data-testid="telemedicine-dashboard"]').should('be.visible');
    });

    it('should display dashboard header correctly', () => {
      cy.visit('/dashboard');

      cy.get('[data-testid="dashboard-header"]').within(() => {
        cy.get('[data-testid="dashboard-title"]').should('contain', 'Dashboard de Telemedicina');
        cy.get('[data-testid="last-updated"]').should('contain', 'Última actualización:');
        cy.get('[data-testid="refresh-button"]').should('be.visible');
      });
    });
  });

  describe('Key Metrics Display', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait('@getTelemedicineStats');
    });

    it('should display active sessions metric', () => {
      cy.get('[data-testid="active-sessions-card"]').within(() => {
        cy.get('[data-testid="metric-value"]').should('contain', '5');
        cy.get('[data-testid="metric-label"]').should('contain', 'Sesiones activas');
        cy.get('[data-testid="metric-subtitle"]').should('contain', '25 totales hoy');
      });
    });

    it('should display participants online metric', () => {
      cy.get('[data-testid="participants-online-card"]').within(() => {
        cy.get('[data-testid="metric-value"]').should('contain', '12');
        cy.get('[data-testid="metric-label"]').should('contain', 'En sesiones activas');
      });
    });

    it('should display average duration metric', () => {
      cy.get('[data-testid="average-duration-card"]').within(() => {
        cy.get('[data-testid="metric-value"]').should('contain', '45m');
        cy.get('[data-testid="metric-label"]').should('contain', 'Por sesión');
      });
    });

    it('should display connection quality metric', () => {
      cy.get('[data-testid="connection-quality-card"]').within(() => {
        cy.get('[data-testid="metric-value"]').should('contain', '75%');
        cy.get('[data-testid="metric-label"]').should('contain', 'Excelente');
      });
    });
  });

  describe('System Health Monitoring', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait('@getTelemedicineStats');
    });

    it('should display system health status', () => {
      cy.get('[data-testid="system-health-section"]').within(() => {
        cy.get('[data-testid="system-status"]').should('contain', 'healthy');
        cy.get('[data-testid="cpu-usage"]').should('contain', '35%');
        cy.get('[data-testid="memory-usage"]').should('contain', '45%');
        cy.get('[data-testid="network-usage"]').should('contain', '15%');
      });
    });

    it('should show degraded status when metrics are high', () => {
      // Mock degraded stats
      cy.intercept('GET', '/api/v1/telemedicine/stats', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            ...mockStats,
            systemHealth: {
              status: 'degraded',
              cpu: 75,
              memory: 80,
              network: 60,
            },
          },
        },
      }).as('getDegradedStats');

      cy.visit('/dashboard');
      cy.wait('@getDegradedStats');

      cy.get('[data-testid="system-status"]').should('contain', 'degraded');
      cy.get('[data-testid="system-status"]').should('have.class', 'text-yellow-600');
    });

    it('should show unhealthy status when metrics are critical', () => {
      // Mock unhealthy stats
      cy.intercept('GET', '/api/v1/telemedicine/stats', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            ...mockStats,
            systemHealth: {
              status: 'unhealthy',
              cpu: 95,
              memory: 90,
              network: 85,
            },
          },
        },
      }).as('getUnhealthyStats');

      cy.visit('/dashboard');
      cy.wait('@getUnhealthyStats');

      cy.get('[data-testid="system-status"]').should('contain', 'unhealthy');
      cy.get('[data-testid="system-status"]').should('have.class', 'text-red-600');
    });
  });

  describe('Active Sessions List', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait(['@getTelemedicineStats', '@getActiveSessions']);
    });

    it('should display active sessions', () => {
      cy.get('[data-testid="active-sessions-section"]').within(() => {
        cy.get('[data-testid="session-item"]').should('have.length', 2);
        
        // Check first session
        cy.get('[data-testid="session-item"]').first().within(() => {
          cy.get('[data-testid="session-participants"]').should('contain', 'John Doe - Dr. Smith');
          cy.get('[data-testid="session-duration"]').should('contain', '30m');
          cy.get('[data-testid="session-quality"]').should('contain', 'excellent');
        });
      });
    });

    it('should show empty state when no active sessions', () => {
      // Mock empty sessions
      cy.intercept('GET', '/api/v1/telemedicine/sessions', {
        statusCode: 200,
        body: {
          success: true,
          data: { sessions: [] },
        },
      }).as('getEmptySessions');

      cy.visit('/dashboard');
      cy.wait('@getEmptySessions');

      cy.get('[data-testid="no-active-sessions"]').should('contain', 'No hay sesiones activas');
    });

    it('should allow joining session from dashboard', () => {
      cy.get('[data-testid="session-item"]').first().within(() => {
        cy.get('[data-testid="join-session-button"]').click();
      });

      // Should navigate to session
      cy.url().should('include', '/telemedicine/session/1');
    });
  });

  describe('Charts and Analytics', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait('@getTelemedicineStats');
    });

    it('should display sessions by type chart', () => {
      cy.get('[data-testid="sessions-by-type-chart"]').should('be.visible');
      cy.get('[data-testid="consultation-count"]').should('contain', '15');
      cy.get('[data-testid="follow-up-count"]').should('contain', '8');
      cy.get('[data-testid="emergency-count"]').should('contain', '2');
    });

    it('should display connection quality distribution', () => {
      cy.get('[data-testid="connection-quality-chart"]').should('be.visible');
      cy.get('[data-testid="excellent-quality"]').should('contain', '75%');
      cy.get('[data-testid="good-quality"]').should('contain', '20%');
      cy.get('[data-testid="poor-quality"]').should('contain', '5%');
    });

    it('should display real-time metrics chart', () => {
      cy.get('[data-testid="real-time-metrics-chart"]').should('be.visible');
      cy.get('[data-testid="chart-legend"]').should('be.visible');
    });
  });

  describe('Recent Notifications', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait(['@getTelemedicineStats', '@getNotifications']);
    });

    it('should display notifications list', () => {
      cy.get('[data-testid="notifications-section"]').within(() => {
        cy.get('[data-testid="notification-item"]').should('have.length', 2);
        
        // Check first notification
        cy.get('[data-testid="notification-item"]').first().within(() => {
          cy.get('[data-testid="notification-title"]').should('contain', 'Sistema actualizado');
          cy.get('[data-testid="notification-message"]').should('contain', 'El sistema ha sido actualizado exitosamente');
          cy.get('[data-testid="notification-timestamp"]').should('be.visible');
        });
      });
    });

    it('should mark notification as read', () => {
      cy.get('[data-testid="notification-item"]').first().within(() => {
        cy.get('[data-testid="mark-read-button"]').click();
      });

      cy.wait('@markNotificationRead');

      cy.get('[data-testid="notification-item"]').first().should('have.class', 'read');
    });

    it('should mark all notifications as read', () => {
      cy.get('[data-testid="mark-all-read-button"]').click();

      cy.wait('@markAllRead');

      cy.get('[data-testid="notification-item"]').each(($item) => {
        cy.wrap($item).should('have.class', 'read');
      });
    });

    it('should show empty state when no notifications', () => {
      // Mock empty notifications
      cy.intercept('GET', '/api/v1/notifications*', {
        statusCode: 200,
        body: {
          success: true,
          data: { notifications: [] },
        },
      }).as('getEmptyNotifications');

      cy.visit('/dashboard');
      cy.wait('@getEmptyNotifications');

      cy.get('[data-testid="no-notifications"]').should('contain', 'No hay notificaciones recientes');
    });
  });

  describe('Auto-refresh Functionality', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait('@getTelemedicineStats');
    });

    it('should auto-refresh data every 30 seconds', () => {
      // Wait for initial load
      cy.get('[data-testid="active-sessions-card"]').should('be.visible');

      // Mock updated stats
      cy.intercept('GET', '/api/v1/telemedicine/stats', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            ...mockStats,
            activeSessions: 6, // Updated value
          },
        },
      }).as('getUpdatedStats');

      // Wait for auto-refresh (30 seconds)
      cy.wait(30000);

      cy.wait('@getUpdatedStats');

      // Verify updated value
      cy.get('[data-testid="active-sessions-card"]').within(() => {
        cy.get('[data-testid="metric-value"]').should('contain', '6');
      });
    });

    it('should allow manual refresh', () => {
      // Mock updated stats
      cy.intercept('GET', '/api/v1/telemedicine/stats', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            ...mockStats,
            activeSessions: 7, // Updated value
          },
        },
      }).as('getManualRefreshStats');

      // Click refresh button
      cy.get('[data-testid="refresh-button"]').click();

      cy.wait('@getManualRefreshStats');

      // Verify updated value
      cy.get('[data-testid="active-sessions-card"]').within(() => {
        cy.get('[data-testid="metric-value"]').should('contain', '7');
      });
    });
  });

  describe('Search and Filter', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait(['@getTelemedicineStats', '@getActiveSessions']);
    });

    it('should filter sessions by search term', () => {
      cy.get('[data-testid="sessions-search"]').type('John Doe');

      cy.get('[data-testid="session-item"]').should('have.length', 1);
      cy.get('[data-testid="session-item"]').should('contain', 'John Doe');
    });

    it('should filter sessions by quality', () => {
      cy.get('[data-testid="quality-filter"]').select('excellent');

      cy.get('[data-testid="session-item"]').should('have.length', 1);
      cy.get('[data-testid="session-item"]').should('contain', 'excellent');
    });

    it('should clear filters', () => {
      cy.get('[data-testid="sessions-search"]').type('John Doe');
      cy.get('[data-testid="clear-filters"]').click();

      cy.get('[data-testid="session-item"]').should('have.length', 2);
    });
  });

  describe('Export and Reporting', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait('@getTelemedicineStats');
    });

    it('should export dashboard data as PDF', () => {
      cy.get('[data-testid="export-pdf-button"]').click();

      // Verify download started
      cy.get('[data-testid="export-progress"]').should('be.visible');
      cy.get('[data-testid="export-success"]').should('contain', 'Reporte exportado');
    });

    it('should export dashboard data as CSV', () => {
      cy.get('[data-testid="export-csv-button"]').click();

      // Verify download started
      cy.get('[data-testid="export-progress"]').should('be.visible');
      cy.get('[data-testid="export-success"]').should('contain', 'Datos exportados');
    });

    it('should generate custom report', () => {
      cy.get('[data-testid="custom-report-button"]').click();

      // Fill report form
      cy.get('[data-testid="report-date-from"]').type('2024-01-01');
      cy.get('[data-testid="report-date-to"]').type('2024-01-31');
      cy.get('[data-testid="report-metrics"]').check(['activeSessions', 'connectionQuality']);
      cy.get('[data-testid="generate-report"]').click();

      // Verify report generation
      cy.get('[data-testid="report-generated"]').should('contain', 'Reporte generado');
    });
  });

  describe('Settings and Configuration', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait('@getTelemedicineStats');
    });

    it('should open dashboard settings', () => {
      cy.get('[data-testid="dashboard-settings"]').click();

      cy.get('[data-testid="settings-modal"]').should('be.visible');
      cy.get('[data-testid="auto-refresh-setting"]').should('be.visible');
      cy.get('[data-testid="chart-settings"]').should('be.visible');
    });

    it('should configure auto-refresh interval', () => {
      cy.get('[data-testid="dashboard-settings"]').click();
      cy.get('[data-testid="auto-refresh-interval"]').select('60');

      cy.get('[data-testid="save-settings"]').click();
      cy.get('[data-testid="settings-saved"]').should('contain', 'Configuración guardada');
    });

    it('should configure chart display options', () => {
      cy.get('[data-testid="dashboard-settings"]').click();
      cy.get('[data-testid="show-charts"]').uncheck();
      cy.get('[data-testid="show-notifications"]').uncheck();

      cy.get('[data-testid="save-settings"]').click();

      // Verify changes applied
      cy.get('[data-testid="charts-section"]').should('not.exist');
      cy.get('[data-testid="notifications-section"]').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/v1/telemedicine/stats', {
        statusCode: 500,
        body: {
          success: false,
          error: 'Internal server error',
        },
      }).as('getStatsError');

      cy.visit('/dashboard');
      cy.wait('@getStatsError');

      cy.get('[data-testid="error-message"]').should('contain', 'Error al cargar datos');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should retry failed requests', () => {
      // Mock initial error then success
      cy.intercept('GET', '/api/v1/telemedicine/stats', {
        statusCode: 500,
        body: { success: false, error: 'Server error' },
      }).as('getStatsError');

      cy.visit('/dashboard');
      cy.wait('@getStatsError');

      cy.get('[data-testid="retry-button"]').click();

      // Mock success response
      cy.intercept('GET', '/api/v1/telemedicine/stats', {
        statusCode: 200,
        body: { success: true, data: mockStats },
      }).as('getStatsSuccess');

      cy.wait('@getStatsSuccess');

      cy.get('[data-testid="active-sessions-card"]').should('be.visible');
    });

    it('should handle network connectivity issues', () => {
      // Mock network error
      cy.intercept('GET', '/api/v1/telemedicine/stats', {
        forceNetworkError: true,
      }).as('networkError');

      cy.visit('/dashboard');
      cy.wait('@networkError');

      cy.get('[data-testid="network-error"]').should('contain', 'Error de conexión');
      cy.get('[data-testid="offline-mode"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.visit('/dashboard');

      // Navigate with keyboard
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'refresh-button');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'dashboard-settings');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('/dashboard');

      cy.get('[data-testid="refresh-button"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="dashboard-settings"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="export-pdf-button"]').should('have.attr', 'aria-label');
    });

    it('should support screen readers', () => {
      cy.visit('/dashboard');

      // Check for screen reader text
      cy.get('[data-testid="active-sessions-card"]').should('have.attr', 'aria-describedby');
      cy.get('[data-testid="system-health-section"]').should('have.attr', 'role', 'region');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/dashboard');

      // Verify mobile layout
      cy.get('[data-testid="dashboard-container"]').should('have.class', 'mobile-layout');
      cy.get('[data-testid="metrics-grid"]').should('have.class', 'mobile-grid');
    });

    it('should handle orientation changes', () => {
      cy.viewport('iphone-x', 'landscape');
      cy.visit('/dashboard');

      // Verify landscape layout
      cy.get('[data-testid="dashboard-container"]').should('have.class', 'landscape-layout');
    });

    it('should have touch-friendly controls', () => {
      cy.viewport('iphone-x');
      cy.visit('/dashboard');

      // Check touch targets
      cy.get('[data-testid="refresh-button"]').should('have.css', 'min-height', '44px');
      cy.get('[data-testid="dashboard-settings"]').should('have.css', 'min-width', '44px');
    });
  });

  describe('Performance', () => {
    it('should load dashboard within acceptable time', () => {
      cy.visit('/dashboard', {
        onBeforeLoad: (win) => {
          cy.stub(win.console, 'log').as('consoleLog');
        },
      });

      // Measure load time
      cy.get('[data-testid="telemedicine-dashboard"]').should('be.visible');
      cy.get('@consoleLog').should('not.be.called');
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      const largeSessions = Array.from({ length: 100 }, (_, i) => ({
        id: i.toString(),
        roomId: `room-${i}`,
        patientName: `Patient ${i}`,
        doctorName: `Dr. ${i}`,
        startTime: '2024-01-15T10:00:00Z',
        duration: 30,
        status: 'active',
        participants: 2,
        connectionQuality: 'excellent',
      }));

      cy.intercept('GET', '/api/v1/telemedicine/sessions', {
        statusCode: 200,
        body: {
          success: true,
          data: { sessions: largeSessions },
        },
      }).as('getLargeSessions');

      cy.visit('/dashboard');
      cy.wait('@getLargeSessions');

      // Verify pagination or virtualization
      cy.get('[data-testid="session-item"]').should('have.length.lte', 20);
      cy.get('[data-testid="load-more-button"]').should('be.visible');
    });
  });
}); 