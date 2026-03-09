import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type GardenState } from "@shared/routes";

// --- GARDEN HOOKS ---

export function useGardenState(code: string | null) {
  return useQuery({
    queryKey: [api.gardens.getState.path, code],
    queryFn: async () => {
      if (!code) return null;
      const url = buildUrl(api.gardens.getState.path, { code });
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch garden state");
      }
      return api.gardens.getState.responses[200].parse(await res.json());
    },
    enabled: !!code,
    refetchInterval: 3000, // Poll every 3s
  });
}

export function useCreateGarden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { code: string; name: string }) => {
      const res = await fetch(api.gardens.create.path, {
        method: api.gardens.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create garden");
      return api.gardens.create.responses[201].parse(await res.json());
    },
  });
}

export function useUpdateHealth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, healthScore }: { code: string; healthScore: number }) => {
      const url = buildUrl(api.gardens.updateHealth.path, { code });
      const res = await fetch(url, {
        method: api.gardens.updateHealth.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ healthScore }),
      });
      if (!res.ok) throw new Error("Failed to update health");
      return api.gardens.updateHealth.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.gardens.getState.path, variables.code] });
    },
  });
}

// --- USER HOOKS ---

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, data }: { code: string; data: any }) => {
      const url = buildUrl(api.gardens.createUser.path, { code });
      const res = await fetch(url, {
        method: api.gardens.createUser.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to join garden");
      return api.gardens.createUser.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.gardens.getState.path, variables.code] });
    },
  });
}

export function useLoginToGarden() {
  return useMutation({
    mutationFn: async ({ code, name }: { code: string; name: string }) => {
      const url = buildUrl(api.gardens.loginUser.path, { code });
      const res = await fetch(url, {
        method: api.gardens.loginUser.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.status === 404) {
        const body = await res.json();
        throw new Error(body.message || "Not found");
      }
      if (!res.ok) throw new Error("Login failed");
      return api.gardens.loginUser.responses[200].parse(await res.json());
    },
  });
}

// --- FLOWER HOOKS ---

export function useCreateFlower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, data }: { code: string; data: any }) => {
      const url = buildUrl(api.gardens.createFlower.path, { code });
      const res = await fetch(url, {
        method: api.gardens.createFlower.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to plant flower");
      return api.gardens.createFlower.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.gardens.getState.path, variables.code] });
    },
  });
}

export function useUpdateFlower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, id, data }: { code: string; id: number; data: any }) => {
      const url = buildUrl(api.gardens.updateFlower.path, { code, id });
      const res = await fetch(url, {
        method: api.gardens.updateFlower.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to move flower");
      return api.gardens.updateFlower.responses[200].parse(await res.json());
    },
    // Optimistic updates could go here for instant dragging
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.gardens.getState.path, variables.code] });
    },
  });
}

// --- LETTER HOOKS ---

export function useCreateLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, data }: { code: string; data: any }) => {
      const url = buildUrl(api.gardens.createLetter.path, { code });
      const res = await fetch(url, {
        method: api.gardens.createLetter.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send letter");
      return api.gardens.createLetter.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.gardens.getState.path, variables.code] });
    },
  });
}

export function useReadLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, id }: { code: string; id: number }) => {
      const url = buildUrl(api.gardens.readLetter.path, { code, id });
      const res = await fetch(url, { method: api.gardens.readLetter.method });
      if (!res.ok) throw new Error("Failed to read letter");
      return api.gardens.readLetter.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.gardens.getState.path, variables.code] });
    },
  });
}
