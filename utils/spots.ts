import { supabase } from "@/constants/supabase";
import { Spot } from "@/constants/types";

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
