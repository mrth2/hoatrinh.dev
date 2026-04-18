import { aboutHandler } from './handlers/about';
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
    aliases: ['whoami'],
    summary: 'Who I am',
    route: '/about',
    handler: aboutHandler,
  },
  {
    name: 'projects',
    aliases: ['work'],
    summary: 'Things I have built',
    route: '/projects',
    handler: projectsHandler,
  },
  {
    name: 'project',
    summary: 'Details for one project',
    argsHint: '<slug>',
    route: (args) => (args[0] ? `/project/${args[0].toLowerCase()}` : null),
    handler: projectHandler,
  },
  {
    name: 'experience',
    aliases: ['cv'],
    summary: 'Past roles',
    route: '/experience',
    handler: experienceHandler,
  },
  {
    name: 'skills',
    aliases: ['stack'],
    summary: 'Tech and tools',
    route: '/skills',
    handler: skillsHandler,
  },
  {
    name: 'contact',
    aliases: ['links'],
    summary: 'Ways to reach me',
    route: '/contact',
    handler: contactHandler,
  },
  { name: 'clear', summary: 'Clear the screen', handler: clearHandler },
];

export const specs: CommandSpec[] = [
  ...baseSpecs,
  {
    name: 'help',
    summary: 'List commands',
    route: '/help',
    handler: makeHelpHandler(() => specs),
  },
];

export const registry = createRegistry(specs);
