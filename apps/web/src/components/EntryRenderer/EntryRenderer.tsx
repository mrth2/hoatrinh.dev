import { Match, Switch } from 'solid-js';
import { ContactBlock } from '../blocks/ContactBlock/ContactBlock';
import { ErrorBlock } from '../blocks/ErrorBlock/ErrorBlock';
import { ExperienceBlock } from '../blocks/ExperienceBlock/ExperienceBlock';
import { HelpBlock } from '../blocks/HelpBlock/HelpBlock';
import { ProfileBlock } from '../blocks/ProfileBlock/ProfileBlock';
import { ProjectBlock } from '../blocks/ProjectBlock/ProjectBlock';
import { ProjectsBlock } from '../blocks/ProjectsBlock/ProjectsBlock';
import { SkillsBlock } from '../blocks/SkillsBlock/SkillsBlock';
import { TextBlock } from '../blocks/TextBlock/TextBlock';
import { OutputPanel, type OutputPanelVariant } from '../OutputPanel/OutputPanel';
import type { TerminalEntry } from '@/terminal/entries';

export function EntryRenderer(props: {
  entry: TerminalEntry;
  onSuggestion?: ((s: string) => void) | undefined;
}) {
  const variant = (): OutputPanelVariant => variantFor(props.entry.kind);
  const meta = () => metaFor(props.entry);

  return (
    <OutputPanel input={props.entry.input} variant={variant()} meta={meta()}>
      <Switch>
        <Match when={props.entry.kind === 'profile'}>
          <ProfileBlock data={(props.entry as Extract<TerminalEntry, { kind: 'profile' }>).data} />
        </Match>
        <Match when={props.entry.kind === 'projects'}>
          <ProjectsBlock data={(props.entry as Extract<TerminalEntry, { kind: 'projects' }>).data} />
        </Match>
        <Match when={props.entry.kind === 'project'}>
          <ProjectBlock data={(props.entry as Extract<TerminalEntry, { kind: 'project' }>).data} />
        </Match>
        <Match when={props.entry.kind === 'experience'}>
          <ExperienceBlock data={(props.entry as Extract<TerminalEntry, { kind: 'experience' }>).data} />
        </Match>
        <Match when={props.entry.kind === 'skills'}>
          <SkillsBlock data={(props.entry as Extract<TerminalEntry, { kind: 'skills' }>).data} />
        </Match>
        <Match when={props.entry.kind === 'contact'}>
          <ContactBlock data={(props.entry as Extract<TerminalEntry, { kind: 'contact' }>).data} />
        </Match>
        <Match when={props.entry.kind === 'help'}>
          <HelpBlock data={(props.entry as Extract<TerminalEntry, { kind: 'help' }>).data} />
        </Match>
        <Match when={props.entry.kind === 'text'}>
          <TextBlock lines={(props.entry as Extract<TerminalEntry, { kind: 'text' }>).lines} />
        </Match>
        <Match when={props.entry.kind === 'error'}>
          <ErrorBlock
            message={(props.entry as Extract<TerminalEntry, { kind: 'error' }>).message}
            suggestions={(props.entry as Extract<TerminalEntry, { kind: 'error' }>).suggestions}
            onSuggestion={props.onSuggestion}
          />
        </Match>
      </Switch>
    </OutputPanel>
  );
}

function variantFor(kind: TerminalEntry['kind']): OutputPanelVariant {
  switch (kind) {
    case 'profile':
    case 'projects':
    case 'project':
    case 'experience':
      return 'titled';
    case 'skills':
    case 'contact':
      return 'frame';
    case 'text':
    case 'help':
    case 'error':
      return 'plain';
  }
}

function metaFor(entry: TerminalEntry): string | undefined {
  switch (entry.kind) {
    case 'profile':
      return 'profile';
    case 'projects': {
      const n = entry.data.length;
      return `${n} ${n === 1 ? 'project' : 'projects'}`;
    }
    case 'project':
      return entry.data.slug;
    case 'experience': {
      const n = entry.data.length;
      return `${n} ${n === 1 ? 'role' : 'roles'}`;
    }
    default:
      return undefined;
  }
}
