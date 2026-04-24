import { render } from 'solid-js/web';

import { App } from './App';
import './styles/global.css';

const root = document.getElementById('app');

if (root === null) {
  throw new Error('Root element #app not found');
}

render(() => <App />, root);
