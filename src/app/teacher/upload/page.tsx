import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentUploadForm } from "@/components/content/ContentUploadForm";

export default function TeacherUploadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload content</h1>
        <p className="text-sm text-muted-foreground">
          Submit a new image with broadcast schedule details. The principal will review before it
          goes live.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New submission</CardTitle>
          <CardDescription>All fields except description are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContentUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
