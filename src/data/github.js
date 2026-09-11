export const GITHUB_REPO = 'jakekohl/small-business-revenue-calculator'
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`
export const GITHUB_MERGED_PRS_URL = `${GITHUB_REPO_URL}/pulls?q=is%3Apr+is%3Amerged`

export function githubPullUrl(pr) {
  return `${GITHUB_REPO_URL}/pull/${pr}`
}
