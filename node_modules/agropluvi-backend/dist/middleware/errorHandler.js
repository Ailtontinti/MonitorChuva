"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({
        message: 'Ocorreu um erro interno. Tente novamente mais tarde.'
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map