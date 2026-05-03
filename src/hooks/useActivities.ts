import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { DbActivity } from "../lib/db-types";
import { translateFields } from "../lib/translate";

export function useActivities() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: async (): Promise<DbActivity[]> => {
      const { data, error } = await supabase.from("activities").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activity: Omit<DbActivity, "id">) => {
      const toTranslate: Record<string, string> = {};
      if (activity.name) toTranslate.name = activity.name;
      if (activity.note) toTranslate.note = activity.note;
      if (activity.address) toTranslate.address = activity.address;
      const payload: Omit<DbActivity, "id"> = { ...activity };
      if (Object.keys(toTranslate).length > 0) {
        const he = await translateFields(toTranslate);
        if (he.name) payload.name_he = he.name;
        if (he.note) payload.note_he = he.note;
        if (he.address) payload.address_he = he.address;
      }

      const { data, error } = await supabase
        .from("activities")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] }),
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activity: Partial<DbActivity> & { id: string }) => {
      const { id, ...updates } = activity;

      const toTranslate: Record<string, string> = {};
      if (updates.name) toTranslate.name = updates.name;
      if (updates.note) toTranslate.note = updates.note;
      if (updates.address) toTranslate.address = updates.address;
      if (Object.keys(toTranslate).length > 0) {
        const he = await translateFields(toTranslate);
        if (he.name) updates.name_he = he.name;
        if (he.note) updates.note_he = he.note;
        if (he.address) updates.address_he = he.address;
      }

      const { data, error } = await supabase
        .from("activities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities"] }),
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activityId: string) => {
      const { error: updateError } = await supabase
        .from("day_schedules")
        .update({ after_gan_activity_id: null, after_gan_time: null })
        .eq("after_gan_activity_id", activityId);
      if (updateError) throw updateError;

      const { error } = await supabase.from("activities").delete().eq("id", activityId);
      if (error) throw error;
      return activityId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
}
