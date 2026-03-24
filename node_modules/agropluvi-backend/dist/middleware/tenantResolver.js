"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantResolver = void 0;
const ORGANIZATION_HEADER = 'x-organization-id';
const tenantResolver = (req, res, next) => {
    const organizationId = req.header(ORGANIZATION_HEADER);
    if (!organizationId) {
        return res.status(400).json({
            message: `Cabeçalho ${ORGANIZATION_HEADER} é obrigatório para identificar a organização (organization_id).`
        });
    }
    req.tenant = { organizationId };
    next();
};
exports.tenantResolver = tenantResolver;
//# sourceMappingURL=tenantResolver.js.map