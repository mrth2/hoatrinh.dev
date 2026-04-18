import type { Project } from '@hoatrinh/content';
import { For } from 'solid-js';
import styles from './ProjectBlock.module.css';

export function ProjectBlock(props: { data: Project }) {
  return (
    <>
      <h1 class={styles.title}>{props.data.title}</h1>
      <p class={styles.tagline}>{props.data.tagline}</p>
      <dl class={styles.meta}>
        <div>
          <dt>Role</dt>
          <dd>{props.data.role}</dd>
        </div>
        <div>
          <dt>Year</dt>
          <dd>{props.data.year}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{props.data.status}</dd>
        </div>
      </dl>
      {props.data.tech.length > 0 && (
        <ul class={styles.tech}>
          <For each={props.data.tech}>{(t) => <li>{t}</li>}</For>
        </ul>
      )}
      <div class={styles.body} innerHTML={props.data.bodyHtml} />
      {(props.data.links.live || props.data.links.repo) && (
        <ul class={styles.links}>
          {props.data.links.live && (
            <li>
              <a href={props.data.links.live}>Live</a>
            </li>
          )}
          {props.data.links.repo && (
            <li>
              <a href={props.data.links.repo}>Repo</a>
            </li>
          )}
        </ul>
      )}
    </>
  );
}
