import { githubPullUrl } from './github.js'

// User-facing notes for the What’s new drawer. Prepend in the same PR as the change.
// See AGENTS.md → Changelog.

export const CHANGELOG = [
  {
    date: '2026-09-11',
    type: 'feature',
    title: 'What’s new',
    summary: 'Tap the star on the right edge to see recent product updates, with links to GitHub when a pull request is listed.',
  },
  {
    date: '2026-09-11',
    type: 'feature',
    title: 'Expenses on their due month',
    summary: 'Quarterly, annual, and one-time costs now hit the month they are due instead of being spread across the year.',
    pr: 4,
  },
  {
    date: '2026-09-11',
    type: 'bug',
    title: 'Spreadsheet numbers stay in their columns',
    summary: 'Price and quantity fields no longer spill into neighboring cells.',
    pr: 3,
  },
]

export function changelogEntryUrl(entry) {
  return entry.pr ? githubPullUrl(entry.pr) : null
}
