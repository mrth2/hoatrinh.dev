import { Route, Router } from '@solidjs/router';
import { NotFoundPage } from './routes/NotFoundPage';
import { TerminalPage } from './routes/TerminalPage';

export function App(props: { url?: string }) {
  return (
    <Router {...(props.url !== undefined ? { url: props.url } : {})}>
      <Route path="/" component={TerminalPage} />
      <Route path="/about" component={TerminalPage} />
      <Route path="/projects" component={TerminalPage} />
      <Route path="/project/:slug" component={TerminalPage} />
      <Route path="/experience" component={TerminalPage} />
      <Route path="/skills" component={TerminalPage} />
      <Route path="/contact" component={TerminalPage} />
      <Route path="/help" component={TerminalPage} />
      <Route path="*" component={NotFoundPage} />
    </Router>
  );
}
