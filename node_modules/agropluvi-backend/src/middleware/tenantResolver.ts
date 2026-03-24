import { NextFunction, Request, Response } from 'express';

const ORGANIZATION_HEADER = 'x-organization-id';

export const tenantResolver = (req: Request, res: Response, next: NextFunction) => {
  const organizationId = req.header(ORGANIZATION_HEADER);

  if (!organizationId) {
    return res.status(400).json({
      message: `Cabeçalho ${ORGANIZATION_HEADER} é obrigatório para identificar a organização (organization_id).`
    });
  }

  req.tenant = { organizationId };

  next();
};

