"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { contentService, type ContentListParams, type ContentListResponse } from "@/services/content.service";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { Stats } from "@/types";

export function useContentList(params: ContentListParams) {
  const { user } = useAuth();

  const scopedParams = useMemo<ContentListParams>(
    () => ({
      ...params,
      teacherId: params.teacherId ?? (user?.role === "teacher" ? user.teacherId : undefined),
    }),
    [params, user?.role, user?.teacherId],
  );
  const paramsKey = useMemo(() => JSON.stringify(scopedParams), [scopedParams]);

  const [data, setData] = useState<ContentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contentService.list(scopedParams);
      setData(res);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load content"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key derived above
  }, [paramsKey]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate auto-fetch on mount/key change
  useEffect(() => { fetchData(); }, [fetchData]);

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

  // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate auto-fetch on mount/teacherId change
  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
