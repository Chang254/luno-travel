import { trpc } from "@/lib/trpc/client";

export function useUpdateTripCity() {
  const utils = trpc.useUtils();

  return trpc.trips.updateCity.useMutation({
    onSuccess: (trip) => {
      utils.trips.list.invalidate();
      utils.trips.get.setData({ id: trip.id }, trip);
    },
  });
}
