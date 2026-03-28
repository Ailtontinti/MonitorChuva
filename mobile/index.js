/**
 * Entry próprio: com npm workspaces o `expo` pode ficar hoistado; o AppEntry
 * padrão resolve `../../App` na raiz do monorepo. Aqui importamos `./App`.
 * Use a API pública `expo` para carregar Expo.fx na ordem correta.
 */
import React from 'react';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';

function Root() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

registerRootComponent(Root);
