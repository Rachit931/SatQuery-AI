import { supabase } from "@/services/supabase";
import type { Zone } from "@/services/satelliteService";

export type WatchZoneRow = {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  geometry: unknown;
  area: number | string | null;
  purpose: string | null;
  monitoring_frequency: string | null;
  satellite_source: string | null;
  cloud_threshold: number | string | null;
  alert_sensitivity: string | null;
  status: string | null;
  risk_score: number | string | null;
  created_at: string | null;
  last_scan_at: string | null;
};

export type CreateWatchZoneInput = {
  name: string;
  location?: string | null;
  geometry: unknown;
  area?: number | null;
  purpose?: string | null;
  monitoringFrequency?: string | null;
  satelliteSource?: string | null;
  cloudThreshold?: number | null;
  alertSensitivity?: string | null;
  status?: Zone["status"];
  riskScore?: number | null;
};

const ZONE_STATUSES: Zone["status"][] = [
  "Active",
  "Stable",
  "Moderate",
  "High Risk",
];

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatTimestamp(value: string | null, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().split("T")[0];
}

function normalizeGeometry(geojson: unknown) {
  if (!geojson || typeof geojson !== "object") return geojson;
  const value = geojson as { type?: string; geometry?: unknown };
  if (value.type === "Feature" && value.geometry) return value.geometry;
  return geojson;
}

function toZoneStatus(status: string | null): Zone["status"] {
  if (status && ZONE_STATUSES.includes(status as Zone["status"])) {
    return status as Zone["status"];
  }
  return "Active";
}

export function mapWatchZoneRow(row: WatchZoneRow): Zone {
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? "",
    geometry: row.geometry,
    area: toNumber(row.area),
    purpose: row.purpose ?? "",
    monitoringFrequency: row.monitoring_frequency ?? "",
    satelliteSource: row.satellite_source ?? "",
    cloudThreshold: toNumber(row.cloud_threshold),
    alertSensitivity: row.alert_sensitivity ?? "",
    status: toZoneStatus(row.status),
    riskScore: toNumber(row.risk_score),
    createdAt: formatTimestamp(row.created_at, ""),
    lastScanAt: row.last_scan_at
      ? formatTimestamp(row.last_scan_at, "")
      : "Never",
  };
}

export async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user, error: null };
}

export async function listWatchZones(): Promise<{
  zones: Zone[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("watch_zones")
    .select(
      "id, user_id, name, location, geometry, area, purpose, monitoring_frequency, satellite_source, cloud_threshold, alert_sensitivity, status, risk_score, created_at, last_scan_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { zones: [], error: error.message };
  }

  return {
    zones: ((data ?? []) as WatchZoneRow[]).map(mapWatchZoneRow),
    error: null,
  };
}

export async function createWatchZone(
  input: CreateWatchZoneInput,
): Promise<{ zone: Zone | null; error: string | null; unauthenticated: boolean }> {
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError) {
    return { zone: null, error: authError, unauthenticated: false };
  }

  if (!user) {
    return {
      zone: null,
      error: "Sign in is required to save a watch zone.",
      unauthenticated: true,
    };
  }

  const { data, error } = await supabase
    .from("watch_zones")
    .insert({
      user_id: user.id,
      name: input.name,
      location: input.location ?? null,
      geometry: normalizeGeometry(input.geometry),
      area: input.area ?? null,
      purpose: input.purpose ?? null,
      monitoring_frequency: input.monitoringFrequency ?? null,
      satellite_source: input.satelliteSource ?? null,
      cloud_threshold: input.cloudThreshold ?? null,
      alert_sensitivity: input.alertSensitivity ?? null,
      status: input.status ?? "Active",
      risk_score: input.riskScore ?? null,
    })
    .select(
      "id, user_id, name, location, geometry, area, purpose, monitoring_frequency, satellite_source, cloud_threshold, alert_sensitivity, status, risk_score, created_at, last_scan_at",
    )
    .single();

  if (error || !data) {
    return {
      zone: null,
      error: error?.message ?? "Failed to save watch zone.",
      unauthenticated: false,
    };
  }

  return {
    zone: mapWatchZoneRow(data as WatchZoneRow),
    error: null,
    unauthenticated: false,
  };
}
