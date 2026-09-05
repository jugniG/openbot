import { createFileRoute } from '@tanstack/react-router'
import { StudioView } from './-components/studio-view'

export const Route = createFileRoute('/studio/')({
  component: StudioIndexPage,
})

function StudioIndexPage() {
  return <StudioView />
}
