/**
 * Entry próprio: com npm workspaces o `expo` pode ficar hoistado; o AppEntry
 * padrão resolve `../../App` na raiz do monorepo. Aqui importamos `./App`.
 * Use a API pública `expo` para carregar Expo.fx na ordem correta.
 */
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
