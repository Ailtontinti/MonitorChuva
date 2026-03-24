"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const DashboardRepository_1 = require("../repositories/DashboardRepository");
class DashboardService {
    constructor(repo = new DashboardRepository_1.DashboardRepository()) {
        this.repo = repo;
    }
    async rainSummary(organizationId, days) {
        const safeDays = Number.isFinite(days) && days > 0 && days <= 60 ? days : 7;
        return this.repo.getRainSummary(organizationId, safeDays);
    }
    async rainGaugesForMap(organizationId) {
        return this.repo.getRainGaugesWithCoords(organizationId);
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=DashboardService.js.map