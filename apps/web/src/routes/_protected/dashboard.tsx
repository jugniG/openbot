import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Card } from '#/components/ui/card'
import { Modal } from '#/components/ui/dialog'
import { Badge as Chip } from '#/components/ui/badge'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '#/orpc/client'
import { Input } from '#/components/Input'
import { Button } from '#/components/Button'
import {
  RiAddLine,
  RiFileList3Line,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiGiftLine,
  RiFileCopyLine,
  RiCheckLine,
} from 'react-icons/ri'

export const Route = createFileRoute('/_protected/dashboard')({
  component: DashboardPage,
})

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

type FormSchemaInput = z.infer<typeof formSchema>

function DashboardPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<{
    id: string
    title: string
    description: string | null
  } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormSchemaInput>({
    resolver: zodResolver(formSchema),
  })

  const { data: forms = [], isLoading } = useQuery(
    orpc.forms.listUserForms.queryOptions(),
  )

  const createMutation = useMutation(
    orpc.forms.createForm.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.forms.listUserForms.key(),
        })
        handleCloseModal()
      },
    }),
  )

  const updateMutation = useMutation(
    orpc.forms.createForm.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.forms.listUserForms.key(),
        })
        handleCloseModal()
      },
    }),
  )

  const deleteMutation = useMutation(
    orpc.forms.createForm.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.forms.listUserForms.key(),
        })
      },
    }),
  )

  const handleOpenCreate = () => {
    setEditingForm(null)
    reset({ title: '', description: '' })
    setIsOpen(true)
  }

  const _handleOpenEdit = (form: {
    id: string
    title: string
    description: string | null
  }) => {
    setEditingForm(form)
    setValue('title', form.title)
    setValue('description', form.description ?? '')
    setIsOpen(true)
  }
  void _handleOpenEdit

  const handleCloseModal = () => {
    setIsOpen(false)
    setEditingForm(null)
    reset()
  }

  const onSubmit = (data: FormSchemaInput) => {
    if (editingForm) {
      updateMutation.mutate({
        title: data.title,
        description: data.description,
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleCopyLink = (formId: string) => {
    const url = `${window.location.origin}/offers/${formId}`
    navigator.clipboard.writeText(url)
    setCopiedId(formId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Gift Forms
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your gift offer forms to collect claims.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          startContent={<RiAddLine className="text-lg" />}
        >
          Create Form
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-44 animate-pulse bg-gray-100 p-4">
              <div className="h-6 w-1/2 rounded bg-gray-200" />
            </Card>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Card.Content className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
              <RiGiftLine className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No forms yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Get started by creating your first gift offer form to share with
              your audience.
            </p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={handleOpenCreate}
              startContent={<RiAddLine className="text-lg" />}
            >
              Create Form
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form: any) => (
            <Card
              key={form.id}
              className="flex flex-col justify-between p-5 hover:shadow-md transition"
            >
              <Card.Header className="flex-col items-start gap-1 p-0 pb-3">
                <div className="flex w-full items-start justify-between">
                  <Card.Title className="truncate text-base font-semibold text-gray-900">
                    {form.title}
                  </Card.Title>
                  <Chip size="sm" color="accent" className="shrink-0">
                    Active
                  </Chip>
                </div>
                {form.description && (
                  <Card.Description className="line-clamp-2 text-xs text-gray-500">
                    {form.description}
                  </Card.Description>
                )}
              </Card.Header>

              <Card.Content className="flex items-center justify-between border-t border-gray-100 px-0 pt-3 text-xs text-gray-500">
                <span>0 gifts</span>
                <span>0 responses</span>
              </Card.Content>

              <Card.Footer className="flex items-center justify-between border-t border-gray-100 px-0 pt-3">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => router.navigate({ to: `/forms/${form.id}` })}
                  >
                    <RiEditLine className="text-sm" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      router.navigate({ to: `/forms/${form.id}/responses` })
                    }
                  >
                    <RiFileList3Line className="text-sm" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCopyLink(form.id)}
                  >
                    {copiedId === form.id ? (
                      <RiCheckLine className="text-sm text-emerald-600" />
                    ) : (
                      <RiFileCopyLine className="text-sm" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    to="/offers/$formId"
                    params={{ formId: form.id }}
                    target="_blank"
                  >
                    <Button size="sm" variant="secondary">
                      <RiEyeLine className="text-sm" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteMutation.mutate({ title: form.title })}
                    isLoading={deleteMutation.isPending}
                  >
                    <RiDeleteBinLine className="text-sm" />
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog className="max-w-md w-full p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header>
                <Card.Title className="text-lg font-semibold">
                  {editingForm ? 'Edit Form' : 'Create Form'}
                </Card.Title>
              </Modal.Header>

              <Modal.Body className="space-y-4 py-4">
                <div>
                  <Input
                    label="Form Title"
                    placeholder="e.g. Summer Holiday Giveaway"
                    {...register('title')}
                    errorMessage={errors.title?.message}
                    isInvalid={!!errors.title}
                  />
                </div>

                <div>
                  <Input
                    label="Description"
                    placeholder="Brief description for recipients"
                    {...register('description')}
                    errorMessage={errors.description?.message}
                    isInvalid={!!errors.description}
                  />
                </div>
              </Modal.Body>

              <Modal.Footer className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingForm ? 'Save Changes' : 'Create'}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </div>
  )
}
