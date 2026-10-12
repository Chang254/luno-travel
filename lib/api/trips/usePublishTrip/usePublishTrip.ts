import { trpc } from "@/lib/trpc/client";

export function usePublishTrip() {
  const utils = trpc.useUtils();

  return trpc.trips.publish.useMutation({
    onSuccess: (published) => {
      utils.trips.list.invalidate();
      utils.trips.getPublication.setData({ id: published.trip_id }, published);
    },
  });
}
