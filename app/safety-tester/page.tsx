import { SafetyTesterForm } from "@/components/safety/safety-tester-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SafetyTesterPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          AI App Safety Tester
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Run basic manual checks against chatbot or RAG responses for prompt
          injection, leakage, unsupported answers, citation issues, and
          cross-role access risk.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual response test</CardTitle>
          <CardDescription>
            Paste one response at a time. API endpoint testing and document-set
            uploads can build on this deterministic test suite later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SafetyTesterForm />
        </CardContent>
      </Card>
    </div>
  )
}
