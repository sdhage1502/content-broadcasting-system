"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { contentService, type ContentListParams, type ContentListResponse } from "@/services/content.service";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { Stats } from "@/types";

export function useContentList(params: ContentListParams) {
  const { user } = useAuth();

  const teacherIdScope = params.teacherId ?? (user?.role === "teacher" ? user.teacherId : undefined);
  const paramsKey = useMemo(
    () => JSON.stringify({ ...params, teacherId: teacherIdScope }),
    [params, teacherIdScope],
  );

  const [data, setData] = useState<ContentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contentService.list(JSON.parse(paramsKey) as ContentListParams);
      setData(res);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load content"));
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useStats() {
  const { user } = useAuth();
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teacherId = user?.role === "teacher" ? user.teacherId : undefined;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contentService.stats({ teacherId });
      setData(res);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load stats"));
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
