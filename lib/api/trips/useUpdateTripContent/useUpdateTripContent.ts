import { trpc } from "@/lib/trpc/client";

export function useUpdateTripContent() {
  const utils = trpc.useUtils();

  return trpc.trips.updateContent.useMutation({
    onSuccess: (trip) => {
      utils.trips.list.invalidate();
      utils.trips.get.invalidate({ id: trip.id });
    },
  });
}
