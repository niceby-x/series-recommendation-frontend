import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeriesDetailTabs from '../SeriesDetailTabs';

const TABS = [
  { id: 'overview', label: 'Overview', content: <p>About text</p> },
  { id: 'episodes', label: 'Episodes', content: <p>Progress widget</p> },
];

describe('SeriesDetailTabs', () => {
  it('shows the first tab by default and keeps the other panel mounted but hidden', () => {
    render(<SeriesDetailTabs tabs={TABS} />);

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('About text')).toBeVisible();
    // Stays mounted so switching back never re-fetches the user's data.
    expect(screen.getByText('Progress widget', { selector: 'p' })).not.toBeVisible();
  });

  it('switches panels on click', async () => {
    const user = userEvent.setup();
    render(<SeriesDetailTabs tabs={TABS} />);

    await user.click(screen.getByRole('tab', { name: 'Episodes' }));

    expect(screen.getByRole('tab', { name: 'Episodes' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Progress widget')).toBeVisible();
    expect(screen.getByText('About text')).not.toBeVisible();
  });

  it('moves between tabs with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<SeriesDetailTabs tabs={TABS} />);

    screen.getByRole('tab', { name: 'Overview' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Episodes' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Episodes' })).toHaveAttribute('aria-selected', 'true');
  });
});
