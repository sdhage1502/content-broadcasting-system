"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { uploadSchema, type UploadInput } from "@/lib/validators";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_LABEL, SUBJECTS, ALLOWED_FILE_EXTENSIONS } from "@/lib/constants";
import { bytesToReadable, cn, getErrorMessage } from "@/lib/utils";
import { contentService } from "@/services/content.service";
import { useAuth } from "@/hooks/useAuth";

const defaultStart = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const defaultEnd = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export function ContentUploadForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
    reset,
  } = useForm<UploadInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      subject: "",
      description: "",
      // file is unset initially
      file: undefined as unknown as File,
      startTime: defaultStart(),
      endTime: defaultEnd(),
      rotationDuration: 5,
    },
  });

  const file = watch("file");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = useCallback(
    (f: File | null) => {
      if (!f) return;
      setValue("file", f, { shouldValidate: true });
    },
    [setValue],
  );

  const onSubmit = async (data: UploadInput) => {
    if (!user?.teacherId) {
      toast.error("Teacher profile missing — please sign in again.");
      return;
    }
    try {
      await contentService.create({
        title: data.title,
        subject: data.subject,
        description: data.description ?? "",
        file: data.file,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        rotationDuration: data.rotationDuration,
        teacherId: user.teacherId,
        teacherName: user.name,
      });
      toast.success("Content submitted for approval");
      reset();
      router.push("/teacher/my-content");
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to upload content"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="e.g. Photosynthesis Diagram" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select id="subject" defaultValue="" {...register("subject")}>
          <option value="" disabled>
            Select subject…
          </option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rotationDuration">Rotation duration (minutes)</Label>
        <Controller
          control={control}
          name="rotationDuration"
          render={({ field }) => (
            <Input
              id="rotationDuration"
              type="number"
              min={1}
              max={1440}
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
        {errors.rotationDuration && (
          <p className="text-xs text-destructive">{errors.rotationDuration.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="startTime">Start time</Label>
        <Input id="startTime" type="datetime-local" {...register("startTime")} />
        {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="endTime">End time</Label>
        <Input id="endTime" type="datetime-local" {...register("endTime")} />
        {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Short context shown to the principal during review…"
          rows={3}
          {...register("description")}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>File</Label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-sm transition-colors",
            dragOver ? "border-primary bg-primary/5" : "hover:bg-accent/40",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_FILE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {preview && file?.type.startsWith("image/") ? (
            <div className="flex w-full flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="max-h-56 rounded-md border bg-background" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5" />
                {file?.name} • {file ? bytesToReadable(file.size) : ""}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setValue("file", undefined as unknown as File, { shouldValidate: true });
                    setPreview(null);
                  }}
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center gap-2">
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{bytesToReadable(file.size)}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setValue("file", undefined as unknown as File, { shouldValidate: true });
                }}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="font-medium">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground">
                {ALLOWED_FILE_EXTENSIONS} up to {MAX_FILE_SIZE_LABEL}
              </p>
            </>
          )}
        </div>
        {errors.file && <p className="text-xs text-destructive">{errors.file.message as string}</p>}
      </div>

      <div className="flex justify-end gap-2 md:col-span-2">
        <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit for approval"}
        </Button>
      </div>
    </form>
  );
}
