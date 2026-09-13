import { supabase } from '@/services/supabase';

export interface AnalysisHistoryItem {
  id: string;
  user_id: string;
  query: string;
  analysis_type: string | null;
  answer: string | null;
  model_used: string | null;
  confidence: number | null;
  result_data: Record<string, unknown> | null;
  zone_id: string | null;
  created_at: string;
}

export interface SaveAnalysisHistoryInput {
  query: string;
  analysis_type?: string | null;
  answer?: string | null;
  model_used?: string | null;
  confidence?: number | null;
  result_data?: Record<string, unknown> | null;
  zone_id?: string | null;
}

interface RawHistoryRow {
  id: string;
  user_id: string;
  query: string;
  analysis_type?: string | null;
  answer?: string | null;
  confidence?: number | null;
  result_data?: Record<string, unknown> | null;
  created_at: string;
  model_used?: string | null;
  zone_id?: string | null;
}

function mapHistoryRow(row: RawHistoryRow): AnalysisHistoryItem {
  const resultObj =
    row.result_data && typeof row.result_data === 'object'
      ? row.result_data
      : null;

  const modelUsed =
    row.model_used ??
    (resultObj && typeof resultObj.model_used === 'string'
      ? resultObj.model_used
      : null);

  const zoneId =
    row.zone_id ??
    (resultObj && typeof resultObj.zone_id === 'string'
      ? resultObj.zone_id
      : null);

  return {
    id: row.id,
    user_id: row.user_id,
    query: row.query,
    analysis_type: row.analysis_type ?? null,
    answer: row.answer ?? null,
    model_used: modelUsed,
    confidence:
      typeof row.confidence === 'number'
        ? row.confidence
        : row.confidence
        ? Number(row.confidence)
        : null,
    result_data: resultObj,
    zone_id: zoneId,
    created_at: row.created_at,
  };
}

/**
 * Fetch all analysis history items for the currently authenticated Supabase user.
 * Ordered by newest first.
 */
export async function getAnalysisHistory(): Promise<{
  data: AnalysisHistoryItem[] | null;
  error: string | null;
}> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: userError?.message || 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    const items = (data || []).map((row: unknown) =>
      mapHistoryRow(row as RawHistoryRow)
    );

    return { data: items, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch history';
    return { data: null, error: message };
  }
}

/**
 * Persist an analysis query and result to Supabase analysis_history.
 * Enforces that user_id matches the authenticated Supabase user.
 */
export async function saveAnalysisHistory(
  input: SaveAnalysisHistoryInput
): Promise<{
  data: AnalysisHistoryItem | null;
  error: string | null;
}> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: userError?.message || 'User not authenticated' };
    }

    // Embed extra metadata like model_used and zone_id inside result_data
    // for seamless persistence with the existing database schema.
    const mergedResultData: Record<string, unknown> = {
      ...input.result_data,
      ...(input.model_used ? { model_used: input.model_used } : {}),
      ...(input.zone_id ? { zone_id: input.zone_id } : {}),
    };

    // Validate UUID format for Postgres zone_id (uuid column).
    // Custom/mock zone IDs (e.g. "yamuna-001") are stored in mergedResultData instead.
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validUuidZoneId =
      input.zone_id && typeof input.zone_id === 'string' && UUID_REGEX.test(input.zone_id)
        ? input.zone_id
        : null;

    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      query: input.query,
      analysis_type: input.analysis_type ?? null,
      answer: input.answer ?? null,
      model_used: input.model_used ?? null,
      confidence: input.confidence ?? null,
      result_data:
        Object.keys(mergedResultData).length > 0 ? mergedResultData : null,
      zone_id: validUuidZoneId,
    };

    let { data, error } = await supabase
      .from('analysis_history')
      .insert(insertPayload)
      .select('*')
      .single();

    // Graceful fallback if table was created without top-level model_used or zone_id columns
    if (error && (error.message?.includes('model_used') || error.message?.includes('zone_id'))) {
      const fallbackPayload: Record<string, unknown> = {
        user_id: user.id,
        query: input.query,
        analysis_type: input.analysis_type ?? null,
        answer: input.answer ?? null,
        confidence: input.confidence ?? null,
        result_data:
          Object.keys(mergedResultData).length > 0 ? mergedResultData : null,
      };
      const fallbackResult = await supabase
        .from('analysis_history')
        .insert(fallbackPayload)
        .select('*')
        .single();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error('[historyService] Failed to save history:', error.message);
      return { data: null, error: error.message };
    }

    return { data: mapHistoryRow(data as RawHistoryRow), error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save analysis history';
    console.error('[historyService] Unexpected save error:', message);
    return { data: null, error: message };
  }
}

/**
 * Safely delete an analysis history item owned by the authenticated user.
 */
export async function deleteAnalysisHistory(
  id: string
): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: userError?.message || 'User not authenticated' };
    }

    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete history item';
    return { success: false, error: message };
  }
}
