"use client";
import { useCallback, useEffect, useState } from "react";
import { Users, Plus, Mail, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContentTable } from "@/components/content/ContentTable";
import { ContentPreview } from "@/components/content/ContentPreview";
import { authService } from "@/services/auth.service";
import { contentService } from "@/services/content.service";
import { getErrorMessage } from "@/lib/utils";
import type { Content, User } from "@/types";

interface TeacherWithStats extends User {
  contentCount: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // Per-teacher content viewer state
  const [viewingTeacher, setViewingTeacher] = useState<TeacherWithStats | null>(null);
  const [teacherContent, setTeacherContent] = useState<Content[] | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [preview, setPreview] = useState<Content | null>(null);

  const validateForm = (): boolean => {
    const errs: { name?: string; email?: string; password?: string } = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(formData.email.trim())) {
      errs.email = "Enter a valid email address";
    }
    if (formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const loadTeacherContent = useCallback(async (teacher: TeacherWithStats) => {
    if (!teacher.teacherId) return;
    setViewingTeacher(teacher);
    setContentLoading(true);
    setTeacherContent(null);
    try {
      const res = await contentService.list({ teacherId: teacher.teacherId, pageSize: 100 });
      setTeacherContent(res.items);
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to load teacher content"));
      setTeacherContent([]);
    } finally {
      setContentLoading(false);
    }
  }, []);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const teacherList = await authService.listTeachers();
      const allContent = await contentService.list({});
      
      const withStats = teacherList.map((t) => ({
        ...t,
        contentCount: allContent.items.filter((c) => c.teacherId === t.teacherId).length,
      }));
      
      setTeachers(withStats);
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to load teachers"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTeachers(); }, [loadTeachers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsCreating(true);
    try {
      await authService.createTeacher(formData);
      toast.success(`Teacher ${formData.name.trim()} created successfully`);
      setFormData({ name: "", email: "", password: "" });
      setFormErrors({});
      setDialogOpen(false);
      loadTeachers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create teacher"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">Manage teachers and view their content.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Teacher</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Teacher Account</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  aria-invalid={!!formErrors.password}
                />
                {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
                <p className="text-xs text-muted-foreground">At least 6 characters.</p>
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Teacher"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
        </div>
      ) : teachers.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Users className="h-12 w-12 text-muted-foreground" /><p className="mt-4 text-muted-foreground">No teachers found.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{teacher.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Content: <strong>{teacher.contentCount}</strong></span>
                  <span className="text-xs text-muted-foreground">ID: {teacher.teacherId}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadTeacherContent(teacher)}
                    disabled={!teacher.teacherId}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> View content
                  </Button>
                  <Link
                    href={`/live/${teacher.teacherId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Live page <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Per-teacher content viewer */}
      <Dialog
        open={!!viewingTeacher}
        onOpenChange={(o) => {
          if (!o) {
            setViewingTeacher(null);
            setTeacherContent(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {viewingTeacher ? `Content by ${viewingTeacher.name}` : "Teacher content"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ContentTable
              items={teacherContent ?? []}
              loading={contentLoading}
              showTeacher={false}
              onPreview={setPreview}
              emptyTitle="No submissions yet"
              emptyDescription="This teacher hasn't uploaded any content."
            />
          </div>
        </DialogContent>
      </Dialog>

      <ContentPreview
        content={preview}
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
      />
    </div>
  );
}
