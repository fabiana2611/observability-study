// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import manual tracing setup
    const { initializeTracerProvider } = await import('./app/lib/tracing');
    
    // Initialize and register manual tracing provider with console exporter
    const manualProvider = await initializeTracerProvider();
    manualProvider.register();
    
    // Keep auto-instrumentation active for co-existence
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
    
    const sdk = new NodeSDK({
      instrumentations: [getNodeAutoInstrumentations()],
    });
    
    sdk.start();
  }
}
