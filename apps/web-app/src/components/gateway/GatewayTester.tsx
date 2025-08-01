// Gateway Testing Component (Phase 1 Development Tool)
// Tests connectivity and functionality of gateway endpoints

'use client'

import { useState } from 'react'
import { useHealthStatus, useEndpointTest, useAuth, useLogin, useLogout } from '@/hooks/gateway-hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Zap } from 'lucide-react'

export default function GatewayTester() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useHealthStatus()
  const { data: authData, isLoading: authLoading } = useAuth()
  const { mutate: testEndpoint } = useEndpointTest()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  // Gateway endpoints to test
  const gatewayEndpoints = [
    { name: 'Health Check', path: '/health', method: 'GET', critical: true },
    { name: 'Health Version', path: '/health/version', method: 'GET', critical: false },
    { name: 'Auth Me', path: '/auth/me', method: 'GET', critical: true },
    { name: 'Global Notifications', path: '/notifications/global', method: 'GET', critical: false }
  ]

  const runEndpointTests = async () => {
    setIsRunningTests(true)
    setTestResults([])
    
    console.log('🧪 [Gateway Tester] Starting endpoint tests...')
    
    for (const endpoint of gatewayEndpoints) {
      try {
        testEndpoint(endpoint.path, {
          onSuccess: (result) => {
            setTestResults(prev => [...prev, {
              ...endpoint,
              ...result,
              success: result.ok
            }])
          },
          onError: (error) => {
            setTestResults(prev => [...prev, {
              ...endpoint,
              success: false,
              error: error.message,
              timestamp: new Date().toISOString()
            }])
          }
        })
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`❌ [Gateway Tester] Test failed for ${endpoint.path}:`, error)
      }
    }
    
    setIsRunningTests(false)
    console.log('✅ [Gateway Tester] All tests completed')
  }

  const testLogin = () => {
    loginMutation.mutate({
      email: 'eeecucondor@gmail.com',
      password: 'test123'
    })
  }

  const getStatusColor = (status?: number, success?: boolean) => {
    if (success === false) return 'destructive'
    if (status === 200) return 'default'
    if (status && status >= 400) return 'destructive'
    return 'secondary'
  }

  const getStatusIcon = (success?: boolean, loading?: boolean) => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />
    if (success === true) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (success === false) return <AlertCircle className="h-4 w-4 text-red-600" />
    return <Zap className="h-4 w-4 text-blue-600" />
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🚪 Gateway Tester</h1>
        <p className="text-gray-600">Phase 1 - Testing backend connectivity for authentication gateway</p>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏥 System Health</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchHealth()}
              disabled={healthLoading}
            >
              <RefreshCw className={`h-4 w-4 ${healthLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking system health...</span>
            </div>
          ) : healthData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={healthData.status === 'healthy' ? 'default' : 'destructive'}>
                  {healthData.status || 'Unknown'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium">{healthData.service || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Version</p>
                <p className="font-medium">{healthData.version || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Uptime</p>
                <p className="font-medium">{healthData.uptime ? `${Math.floor(healthData.uptime)}s` : 'Unknown'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Unable to connect to backend server</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          {authLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking authentication...</span>
            </div>
          ) : authData ? (
            <div className="space-y-2">
              <p><strong>User:</strong> {authData.name} ({authData.email})</p>
              <p><strong>Role:</strong> <Badge>{authData.role}</Badge></p>
              <p><strong>Status:</strong> <Badge variant={authData.status === 'active' ? 'default' : 'destructive'}>{authData.status}</Badge></p>
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">Not authenticated</p>
              <Button 
                onClick={testLogin}
                disabled={loginMutation.isPending}
                className="w-full sm:w-auto"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Testing Login...
                  </>
                ) : (
                  'Test Login (eeecucondor@gmail.com)'
                )}
              </Button>
              {loginMutation.error && (
                <p className="text-red-600 text-sm">
                  Login failed: {loginMutation.error.message}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Endpoint Testing */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Endpoint Testing</CardTitle>
          <CardDescription>
            Testing connectivity to all legitimate gateway endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runEndpointTests}
              disabled={isRunningTests}
              className="w-full sm:w-auto"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Running Tests...
                </>
              ) : (
                'Run All Endpoint Tests'
              )}
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Test Results:</h4>
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.success, false)}
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-gray-500">{result.method} {result.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(result.status, result.success)}>
                        {result.status || 'Error'}
                      </Badge>
                      {result.critical && (
                        <Badge variant="outline" className="text-xs">
                          Critical
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Development Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">📋 Phase 1 Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-700">
            <p><strong>Current Phase:</strong> Gateway Backend Integration</p>
            <p><strong>API Base URL:</strong> http://localhost:3001/api</p>
            <p><strong>Gateway Endpoints:</strong> 10 total (auth, health, notifications)</p>
            <p><strong>Legacy Endpoints:</strong> 40+ (to be migrated in Phase 2-6)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Basic UI Components (if not available)
const Card = ({ children, className = '' }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children }: any) => (
  <div className="flex flex-col space-y-1.5 p-6">
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
)

const CardDescription = ({ children }: any) => (
  <p className="text-sm text-muted-foreground">
    {children}
  </p>
)

const CardContent = ({ children }: any) => (
  <div className="p-6 pt-0">
    {children}
  </div>
)

const Button = ({ children, className = '', variant = 'default', size = 'default', disabled = false, onClick, ...props }: any) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  }
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3'
  }
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80 bg-blue-600 text-white',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80 bg-red-600 text-white',
    outline: 'text-foreground border border-gray-300',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gray-200 text-gray-800'
  }
  
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}