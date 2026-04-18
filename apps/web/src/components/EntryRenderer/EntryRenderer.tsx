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
import { InputEcho } from '../InputEcho/InputEcho';
import type { TerminalEntry } from '@/terminal/entries';
import styles from './EntryRenderer.module.css';

export function EntryRenderer(props: {
  entry: TerminalEntry;
  onSuggestion?: ((s: string) => void) | undefined;
}) {
  const labelId = `entry-${props.entry.id}-label`;
  return (
    <article class={styles.entry} data-kind={props.entry.kind} aria-labelledby={labelId}>
      <h2 id={labelId} class="sr-only">Output of: {props.entry.input || 'empty'}</h2>
      <InputEcho text={props.entry.input} />
      <div class={styles.body}>
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
      </div>
    </article>
  );
}
