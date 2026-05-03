import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { DbPerson } from "../lib/db-types";

export function usePeople() {
  return useQuery({
    queryKey: ["people"],
    queryFn: async (): Promise<DbPerson[]> => {
      const { data, error } = await supabase.from("people").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (person: Partial<DbPerson> & { id: string }) => {
      const { data, error } = await supabase
        .from("people")
        .update(person)
        .eq("id", person.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people"] }),
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (person: Omit<DbPerson, "id">) => {
      const { data, error } = await supabase
        .from("people")
        .insert(person)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people"] }),
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("people").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people"] }),
  });
}
