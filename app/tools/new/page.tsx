import { createToolAction } from "@/app/tools/actions"
import { ToolForm } from "@/components/tools/tool-form"
import { emptyToolFormValues, type ToolFormState } from "@/lib/tools/form"

const initialState: ToolFormState = {
  values: emptyToolFormValues,
  errors: {},
}

export default function NewToolPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add AI Tool</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Add a tool to the registry and define the conditions under which it
          can be used.
        </p>
      </div>
      <ToolForm
        action={createToolAction}
        initialState={initialState}
        cancelHref="/tools"
        submitLabel="Create tool"
      />
    </div>
  )
}
