// 💳 PAYMENT SYSTEM - ALTAMEDICA
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    BanknotesIcon,
    Check,
    Clock,
    CreditCard, DollarSign,
    FileText,
    Receipt,
    Shield,
    TrendingUp,
    Users,
    Wallet
} from 'lucide-react';
import React, { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'insurance' | 'cash';
  name: string;
  details: string;
  isDefault: boolean;
  isVerified: boolean;
  expiryDate?: string;
}

interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  serviceType: 'consultation' | 'telemedicine' | 'prescription' | 'lab' | 'procedure';
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: string;
  insuranceClaim?: {
    provider: string;
    claimNumber: string;
    approvedAmount: number;
    status: 'submitted' | 'approved' | 'denied' | 'processing';
  };
}

interface InsuranceProvider {
  id: string;
  name: string;
  logo: string;
  coverage: number; // percentage
  copay: number;
  deductible: number;
  remainingDeductible: number;
  networkStatus: 'in-network' | 'out-of-network';
}

interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  monthlyGrowth: number;
  averageInvoiceAmount: number;
  paymentMethodDistribution: {
    card: number;
    insurance: number;
    cash: number;
    bank: number;
  };
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card-1',
    type: 'card',
    name: 'Visa terminada en 4242',
    details: '**** **** **** 4242',
    isDefault: true,
    isVerified: true,
    expiryDate: '12/25'
  },
  {
    id: 'insurance-1',
    type: 'insurance',
    name: 'Seguro Nacional de Salud',
    details: 'Póliza: SNS-123456789',
    isDefault: false,
    isVerified: true
  },
  {
    id: 'bank-1',
    type: 'bank',
    name: 'Cuenta Corriente BBVA',
    details: 'ES91 2100 0418 4502 0005 1332',
    isDefault: false,
    isVerified: true
  }
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    patientId: 'patient-123',
    patientName: 'Juan Pérez',
    doctorId: 'doctor-456',
    doctorName: 'Dr. María González',
    serviceType: 'consultation',
    description: 'Consulta de cardiología - Revisión anual',
    amount: 120.00,
    currency: 'EUR',
    status: 'paid',
    issueDate: new Date('2025-01-01'),
    dueDate: new Date('2025-01-15'),
    paidDate: new Date('2025-01-03'),
    paymentMethod: 'Visa terminada en 4242',
    insuranceClaim: {
      provider: 'Seguro Nacional',
      claimNumber: 'SNS-2025-001',
      approvedAmount: 100.00,
      status: 'approved'
    }
  },
  {
    id: 'inv-002',
    patientId: 'patient-456',
    patientName: 'Ana López',
    doctorId: 'doctor-789',
    doctorName: 'Dr. Carlos Rodríguez',
    serviceType: 'telemedicine',
    description: 'Consulta virtual - Seguimiento diabetes',
    amount: 80.00,
    currency: 'EUR',
    status: 'pending',
    issueDate: new Date('2025-01-03'),
    dueDate: new Date('2025-01-18')
  },
  {
    id: 'inv-003',
    patientId: 'patient-789',
    patientName: 'Pedro Martín',
    doctorId: 'doctor-456',
    doctorName: 'Dr. María González',
    serviceType: 'lab',
    description: 'Análisis de sangre completo',
    amount: 150.00,
    currency: 'EUR',
    status: 'overdue',
    issueDate: new Date('2024-12-20'),
    dueDate: new Date('2025-01-05')
  }
];

const MOCK_INSURANCE: InsuranceProvider = {
  id: 'sns-1',
  name: 'Seguro Nacional de Salud',
  logo: '/api/placeholder/40/40',
  coverage: 80,
  copay: 20,
  deductible: 200,
  remainingDeductible: 50,
  networkStatus: 'in-network'
};

const MOCK_STATS: PaymentStats = {
  totalRevenue: 15420.50,
  pendingPayments: 2340.00,
  monthlyGrowth: 12.5,
  averageInvoiceAmount: 95.75,
  paymentMethodDistribution: {
    card: 45,
    insurance: 35,
    cash: 15,
    bank: 5
  }
};

export const PaymentSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [stats, setStats] = useState<PaymentStats>(MOCK_STATS);

  // Process payment
  const processPayment = async (invoiceId: string, paymentMethodId: string) => {
    setPaymentInProgress(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === invoiceId 
            ? { 
                ...invoice, 
                status: 'paid' as const,
                paidDate: new Date(),
                paymentMethod: paymentMethods.find(pm => pm.id === paymentMethodId)?.name
              }
            : invoice
        )
      );
      
      setSelectedInvoice(null);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + (selectedInvoice?.amount || 0),
        pendingPayments: prev.pendingPayments - (selectedInvoice?.amount || 0)
      }));
      
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setPaymentInProgress(false);
    }
  };

  // Generate receipt
  const generateReceipt = (invoice: Invoice) => {
    // Simulate receipt generation
    console.log('Generating receipt for invoice:', invoice.id);
    
    // In a real implementation, this would generate a PDF receipt
    const receiptData = {
      invoiceId: invoice.id,
      patientName: invoice.patientName,
      doctorName: invoice.doctorName,
      amount: invoice.amount,
      paidDate: invoice.paidDate,
      paymentMethod: invoice.paymentMethod
    };
    
    // Download receipt (simulation)
    const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${invoice.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get service type icon
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'consultation': return <Users className="h-4 w-4" />;
      case 'telemedicine': return <CreditCard className="h-4 w-4" />;
      case 'prescription': return <FileText className="h-4 w-4" />;
      case 'lab': return <AlertCircle className="h-4 w-4" />;
      case 'procedure': return <Shield className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="h-8 w-8 text-green-600" />
              Sistema de Pagos
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión integral de facturación y pagos médicos
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button className="bg-green-600 hover:bg-green-700">
              <Receipt className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{stats.monthlyGrowth}% este mes</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    €{stats.pendingPayments.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {invoices.filter(i => i.status === 'pending').length} facturas pendientes
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio por Factura</p>
                  <p className="text-2xl font-bold text-blue-600">
                    €{stats.averageInvoiceAmount}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Basado en últimas 100 facturas
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Métodos de Pago</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {paymentMethods.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {paymentMethods.filter(pm => pm.isVerified).length} verificados
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="invoices">Facturas</TabsTrigger>
            <TabsTrigger value="payments">Métodos de Pago</TabsTrigger>
            <TabsTrigger value="insurance">Seguros</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle>Facturas Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getServiceIcon(invoice.serviceType)}
                          <div>
                            <p className="font-medium text-sm">{invoice.patientName}</p>
                            <p className="text-xs text-gray-500">{invoice.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{invoice.amount}</p>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Métodos de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tarjetas de Crédito</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${stats.paymentMethodDistribution.card}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.paymentMethodDistribution.card}%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Seguros</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${stats.paymentMethodDistribution.insurance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.paymentMethodDistribution.insurance}%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Efectivo</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${stats.paymentMethodDistribution.cash}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.paymentMethodDistribution.cash}%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transferencia</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${stats.paymentMethodDistribution.bank}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.paymentMethodDistribution.bank}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Facturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-4">
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="paid">Pagado</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="overdue">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Tipo de servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="consultation">Consulta</SelectItem>
                        <SelectItem value="telemedicine">Telemedicina</SelectItem>
                        <SelectItem value="lab">Laboratorio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Invoice List */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Paciente</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Servicio</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Importe</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Vencimiento</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-sm">{invoice.patientName}</p>
                                <p className="text-xs text-gray-500">ID: {invoice.id}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getServiceIcon(invoice.serviceType)}
                                <span className="text-sm">{invoice.description}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium">€{invoice.amount}</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={getStatusColor(invoice.status)}>
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm">{invoice.dueDate.toLocaleDateString()}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {invoice.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => setSelectedInvoice(invoice)}
                                  >
                                    Pagar
                                  </Button>
                                )}
                                {invoice.status === 'paid' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => generateReceipt(invoice)}
                                  >
                                    Recibo
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {method.type === 'card' && <CreditCard className="h-5 w-5 text-blue-600" />}
                            {method.type === 'bank' && <BanknotesIcon className="h-5 w-5 text-blue-600" />}
                            {method.type === 'insurance' && <Shield className="h-5 w-5 text-blue-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{method.name}</p>
                            <p className="text-xs text-gray-500">{method.details}</p>
                            {method.expiryDate && (
                              <p className="text-xs text-gray-500">Vence: {method.expiryDate}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {method.isDefault && (
                            <Badge variant="secondary">Predeterminado</Badge>
                          )}
                          {method.isVerified && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Agregar Método de Pago
                  </Button>
                </CardContent>
              </Card>

              {/* Add Payment Method Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Tarjeta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Número de Tarjeta</label>
                    <Input placeholder="1234 5678 9012 3456" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Expiración</label>
                      <Input placeholder="MM/AA" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">CVV</label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Nombre del Titular</label>
                    <Input placeholder="Juan Pérez" />
                  </div>
                  
                  <Button className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Agregar Tarjeta Segura
                  </Button>
                  
                  <div className="text-xs text-gray-500 text-center">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Tus datos están protegidos con cifrado SSL de 256 bits
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de Seguro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Insurance Card */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{MOCK_INSURANCE.name}</h3>
                      <Badge className="bg-white/20 text-white">
                        {MOCK_INSURANCE.networkStatus === 'in-network' ? 'En Red' : 'Fuera de Red'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Cobertura:</span>
                        <span className="font-medium">{MOCK_INSURANCE.coverage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Copago:</span>
                        <span className="font-medium">€{MOCK_INSURANCE.copay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deducible:</span>
                        <span className="font-medium">€{MOCK_INSURANCE.deductible}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deducible Restante:</span>
                        <span className="font-medium">€{MOCK_INSURANCE.remainingDeductible}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Claims */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Reclamaciones Recientes</h3>
                    <div className="space-y-3">
                      {invoices
                        .filter(invoice => invoice.insuranceClaim)
                        .slice(0, 3)
                        .map((invoice) => (
                          <div key={invoice.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{invoice.description}</p>
                                <p className="text-xs text-gray-500">
                                  Reclamación: {invoice.insuranceClaim?.claimNumber}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">€{invoice.insuranceClaim?.approvedAmount}</p>
                                <Badge className={
                                  invoice.insuranceClaim?.status === 'approved' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }>
                                  {invoice.insuranceClaim?.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Revenue Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos Mensuales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                      <p>Gráfico de ingresos mensuales</p>
                      <p className="text-sm">Integración con Chart.js pendiente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Pagos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tasa de Cobro</span>
                    <span className="font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tiempo Promedio de Pago</span>
                    <span className="font-bold">8.5 días</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Facturas Vencidas</span>
                    <span className="font-bold text-red-600">
                      {invoices.filter(i => i.status === 'overdue').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Reclamaciones Aprobadas</span>
                    <span className="font-bold text-blue-600">87.3%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Procesar Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium">{selectedInvoice.description}</h3>
                  <p className="text-sm text-gray-600">Paciente: {selectedInvoice.patientName}</p>
                  <p className="text-lg font-bold mt-2">€{selectedInvoice.amount}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Método de Pago</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => processPayment(selectedInvoice.id, paymentMethods[0].id)}
                    disabled={paymentInProgress}
                  >
                    {paymentInProgress ? 'Procesando...' : 'Pagar Ahora'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedInvoice(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSystem;
