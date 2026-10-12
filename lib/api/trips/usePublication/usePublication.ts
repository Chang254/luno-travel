import { trpc } from "@/lib/trpc/client";

export function usePublication(id: string) {
  return trpc.trips.getPublication.useQuery({ id });
}
