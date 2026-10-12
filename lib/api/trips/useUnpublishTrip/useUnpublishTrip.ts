import { trpc } from "@/lib/trpc/client";

export function useUnpublishTrip() {
  const utils = trpc.useUtils();

  return trpc.trips.unpublish.useMutation({
    onSuccess: (_, { id }) => {
      utils.trips.list.invalidate();
      utils.trips.getPublication.setData({ id }, null);
    },
  });
}
