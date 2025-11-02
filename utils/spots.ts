import { supabase } from "@/constants/supabase";
import { Report, Spot } from "@/constants/types";

export const loadSpots = async (): Promise<Spot[]> => {
  try {
    const { data, error } = await supabase.from("spots").select("*");
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("error loading spots:", error);
    return [];
  }
};

export const addSpot = async (
  spot: Omit<Spot, "id" | "created_at">
): Promise<Spot | null> => {
  try {
    const { data, error } = await supabase
      .from("spots")
      .insert([spot])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error("error adding spot:", error);
    return null;
  }
};

export const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("error fetching IP:", error);
    return "unknown";
  }
};

export const addRating = async (
  spotId: number,
  rating: number,
  ip: string,
  comment?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("ratings")
      .insert([{ spot_id: spotId, rating, ip, comment }]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding rating:", error);
    if (error.message.includes("duplicate key")) {
      console.log("Rating already exists for this IP and spot.");
    }
    return false;
  }
};

export const addReport = async (
  spotId: number,
  reason: string,
  ip: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("reports")
      .insert([{ spot_id: spotId, reason, ip }]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding report:", error);
    return false;
  }
};

export const loadReports = async (): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select("*, spot:spots(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("error loading reports:", error);
    return [];
  }
};

export const deleteReport = async (reportId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting report:", error);
    return false;
  }
};

export const deleteSpot = async (spotId: number): Promise<boolean> => {
  try {
    await supabase.from("ratings").delete().eq("spot_id", spotId);
    await supabase.from("reports").delete().eq("spot_id", spotId);
    const { error } = await supabase.from("spots").delete().eq("id", spotId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting spot:", error);
    return false;
  }
};
