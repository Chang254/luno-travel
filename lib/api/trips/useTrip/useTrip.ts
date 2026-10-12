import { trpc } from "@/lib/trpc/client";

export function useTrip(id: string) {
  return trpc.trips.get.useQuery({ id });
}
