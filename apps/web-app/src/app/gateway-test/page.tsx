// Gateway Testing Page - Phase 1 Development Tool
// Accessible at /gateway-test during development

import GatewayTester from '@/components/gateway/GatewayTester'

export default function GatewayTestPage() {
  return <GatewayTester />
}

export const metadata = {
  title: 'Gateway Tester - AltaMedica',
  description: 'Phase 1 development tool for testing gateway backend integration'
}