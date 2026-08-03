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
