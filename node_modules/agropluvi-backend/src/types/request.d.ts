import 'express-serve-static-core';

export interface TenantContext {
  organizationId: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    tenant?: TenantContext;
    userId?: string;
  }
}

