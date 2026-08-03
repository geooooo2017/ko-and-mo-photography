import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

export type AvailabilityStatus = "available" | "limited" | "booked";

export type AvailabilityRow = {
  id: string;
  date: string;
  status: AvailabilityStatus;
  note: string | null;
};

export type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  event_type: string;
  location: string | null;
  message: string | null;
  estimated_total: number | null;
  status: "new" | "contacted" | "booked" | "archived";
  created_at: string;
};

export type EnquiryInsert = {
  name: string;
  email: string;
  phone?: string;
  event_date?: string;
  event_type: string;
  location?: string;
  message?: string;
  estimated_total?: number;
};

export type ReviewStatus = "pending" | "published" | "hidden";
export type ReviewSource = "manual" | "invite";
export type InviteStatus = "pending" | "used" | "revoked";

export type ReviewRow = {
  id: string;
  name: string;
  session_type: string;
  quote: string;
  rating: number;
  status: ReviewStatus;
  source: ReviewSource;
  invite_id: string | null;
  created_at: string;
  published_at: string | null;
};

export type ReviewInviteRow = {
  id: string;
  token: string;
  customer_name: string | null;
  customer_email: string | null;
  session_type: string | null;
  note: string | null;
  status: InviteStatus;
  created_at: string;
  used_at: string | null;
  expires_at: string | null;
};

export const SESSION_TYPES = [
  "Wedding",
  "Newborn",
  "Family",
  "Cake Smash",
  "Mini Session",
  "Other",
] as const;

export function reviewInviteUrl(token: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/review/${token}`;
  }
  return `/review/${token}`;
}
