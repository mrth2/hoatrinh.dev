import './styles/tokens.css';
import './styles/reset.css';
import './styles/fonts.css';
import './styles/global.css';
import { hydrate } from 'solid-js/web';
import { App } from './App';

const root = document.getElementById('app');
if (!root) throw new Error('#app root missing');
hydrate(() => <App />, root);
