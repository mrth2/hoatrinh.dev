import { Route, Router, type RouteSectionProps } from '@solidjs/router';
import { NotFoundPage } from './routes/NotFoundPage';
import { TerminalPage } from './routes/TerminalPage';

export function App(props: { url?: string }) {
  return (
    <Router {...(props.url !== undefined ? { url: props.url } : {})}>
      <Route path="/" component={() => <TerminalPage initialCommand="about" />} />
      <Route path="/about" component={() => <TerminalPage initialCommand="about" />} />
      <Route path="/projects" component={() => <TerminalPage initialCommand="projects" />} />
      <Route
        path="/project/:slug"
        component={(p: RouteSectionProps) => (
          <TerminalPage initialCommand={`project ${p.params.slug}`} />
        )}
      />
      <Route path="/experience" component={() => <TerminalPage initialCommand="experience" />} />
      <Route path="/skills" component={() => <TerminalPage initialCommand="skills" />} />
      <Route path="/contact" component={() => <TerminalPage initialCommand="contact" />} />
      <Route path="/help" component={() => <TerminalPage initialCommand="help" />} />
      <Route path="*" component={NotFoundPage} />
    </Router>
  );
}
