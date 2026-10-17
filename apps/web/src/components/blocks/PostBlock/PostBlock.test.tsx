import type { BlogPost } from '@hoatrinh/content';
import { cleanup, render } from '@solidjs/testing-library';
import { afterEach, describe, expect, it } from 'vitest';
import { PostBlock } from './PostBlock';

const post: BlogPost = {
  slug: 'middle',
  title: 'Middle post',
  date: '2026-05-01',
  excerpt: 'A post in the middle.',
  tag: 'tools',
  readingTime: 3,
  bodyHtml: '<p>Body</p>',
};

describe('PostBlock', () => {
  afterEach(cleanup);

  it('links to the newer and older posts', () => {
    const { getByRole } = render(() => (
      <PostBlock
        data={{
          post,
          next: { slug: 'newer', title: 'Newer post' },
          prev: { slug: 'older', title: 'Older post' },
        }}
      />
    ));
    expect(getByRole('link', { name: /newer: Newer post/ })).toHaveAttribute('href', '/post/newer');
    expect(getByRole('link', { name: /older: Older post/ })).toHaveAttribute('href', '/post/older');
  });

  it('omits the pager when there are no neighbours', () => {
    const { queryByRole } = render(() => <PostBlock data={{ post }} />);
    expect(queryByRole('navigation', { name: 'More posts' })).toBeNull();
  });
});
