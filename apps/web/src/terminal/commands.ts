import { aboutHandler } from './handlers/about';
import { askHandler } from './handlers/ask';
import { clearHandler } from './handlers/clear';
import { contactHandler } from './handlers/contact';
import { experienceHandler } from './handlers/experience';
import { makeHelpHandler } from './handlers/help';
import { projectHandler } from './handlers/project';
import { projectsHandler } from './handlers/projects';
import { skillsHandler } from './handlers/skills';
import { type CommandSpec, createRegistry } from './registry';

const baseSpecs: CommandSpec[] = [
  {
    name: 'about',
    aliases: ['whoami', 'me', 'a', 'who', 'bio', 'profile'],
    summary: 'Who I am',
    route: '/about',
    handler: aboutHandler,
  },
  {
    name: 'projects',
    aliases: ['work', 'ls', 'p', 'portfolio', 'built', 'stuff'],
    summary: 'Things I have built',
    route: '/projects',
    handler: projectsHandler,
  },
  {
    name: 'project',
    aliases: ['open', 'show', 'view', 'get', 'detail', 'info'],
    summary: 'Details for one project',
    argsHint: '<slug>',
    route: (args) => (args[0] ? `/project/${args[0].toLowerCase()}` : null),
    handler: projectHandler,
  },
  {
    name: 'experience',
    aliases: ['cv', 'exp', 'jobs', 'career', 'resume', 'history', 'past'],
    summary: 'Past roles',
    route: '/experience',
    handler: experienceHandler,
  },
  {
    name: 'skills',
    aliases: ['stack', 's', 'tech', 'tools', 'languages', 'know'],
    summary: 'Tech and tools',
    route: '/skills',
    handler: skillsHandler,
  },
  {
    name: 'contact',
    aliases: ['links', 'c', 'reach', 'hire', 'email', 'dm', 'social'],
    summary: 'Ways to reach me',
    route: '/contact',
    handler: contactHandler,
  },
  {
    name: 'ask',
    aliases: ['chat', 'q', 'ai'],
    summary: 'Ask about me',
    argsHint: '<question>',
    handler: askHandler,
  },
  {
    name: 'clear',
    aliases: ['cls', 'clr', 'reset', 'clean'],
    summary: 'Clear the screen',
    handler: clearHandler,
  },
];

export const specs: CommandSpec[] = [
  ...baseSpecs,
  {
    name: 'help',
    aliases: ['h', '?', 'man', 'commands', 'list'],
    summary: 'List commands',
    route: '/help',
    handler: makeHelpHandler(() => specs),
  },
];

export const registry = createRegistry(specs);
