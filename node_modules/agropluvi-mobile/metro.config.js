const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [projectRoot, monorepoRoot];

// Ordem importa: a raiz do workspace deve vir PRIMEIRO.
// Se `mobile/node_modules` vier antes, o Metro pode carregar um React e as
// libs hoistadas em `../node_modules` carregam outro — erro clássico no Hermes
// (ex.: ReferenceError: Property 'r' doesn't exist).
const rootNm = path.resolve(monorepoRoot, 'node_modules');

config.resolver.nodeModulesPaths = [rootNm, path.resolve(projectRoot, 'node_modules')];

// Hermes + Metro com `exports` do package.json pode quebrar no dispositivo
// (ex.: ReferenceError em propriedade minificada / "[runtime not ready]").
// Ver: https://github.com/expo/expo/issues/36635 e discussões em SDK 53+.
config.resolver.unstable_enablePackageExports = false;

// Não use extraNodeModules para react aqui: no Hermes pode quebrar subpaths como
// `react/jsx-runtime` e gerar ReferenceError (Property 'r' doesn't exist).
// A ordem em nodeModulesPaths + overrides no package.json da raiz já deduplicam.

module.exports = config;
