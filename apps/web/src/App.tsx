import { Route, Router } from '@solidjs/router';
import { TerminalPage } from './routes/TerminalPage';

export function App(props: { url?: string }) {
  return (
    <Router {...(props.url !== undefined ? { url: props.url } : {})}>
      <Route path="/*" component={TerminalPage} />
    </Router>
  );
}
