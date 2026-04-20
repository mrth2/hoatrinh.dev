import type { Link } from './schema';

const links: Link[] = [
  { label: 'Email', href: 'mailto:hi@hoatrinh.dev', kind: 'email' },
  { label: 'GitHub', href: 'https://github.com/mrth2', kind: 'code' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hoa-trinh-dev/', kind: 'social' },
];

export function getLinks(): Link[] {
  return links;
}
