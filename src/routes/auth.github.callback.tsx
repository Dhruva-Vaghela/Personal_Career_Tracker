import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/github/callback')({
  beforeLoad: ({ location }) => {
    // Grab the query params (like code, setup_action, etc.)
    const search = location.search;
    
    // Redirect cleanly to the /github route which handles the logic
    throw redirect({
      to: '/github',
      search: search as Record<string, unknown>,
    })
  },
  component: () => null, // Never renders because of beforeLoad redirect
})
