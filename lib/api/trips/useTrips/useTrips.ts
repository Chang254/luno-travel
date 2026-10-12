import { trpc } from "@/lib/trpc/client";

export function useTrips() {
  return trpc.trips.list.useQuery();
}
