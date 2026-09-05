import { createFileRoute } from '@tanstack/react-router'
import type { AgentSpec } from '@repo/types'
import { client } from '#/orpc/client'
import { StudioView } from './-components/studio-view'

export const Route = createFileRoute('/studio/$agentId')({
  loader: async ({ params }): Promise<{ agent?: AgentSpec }> => {
    try {
      const agent = (await client.engineer.getSpecialist({
        id: params.agentId,
      })) as AgentSpec
      return { agent }
    } catch (err) {
      console.warn('Failed to pre-load agent in loader:', err)
      return { agent: undefined }
    }
  },
  component: StudioAgentPage,
})

function StudioAgentPage() {
  const { agentId } = Route.useParams()
  const data = Route.useLoaderData()
  return <StudioView routeAgentId={agentId} initialAgent={data?.agent} />
}
