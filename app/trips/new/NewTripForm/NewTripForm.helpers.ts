import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  pickedPlaceSchema,
  tripDetailsFormSchema,
} from "@/components/TripDetailsFields/TripDetailsFields.helpers";
import { useCreateTrip } from "@/lib/api/trips";

/** A new trip's place always comes from a fresh pick, so it can be resolved by the server. */
export const newTripFormSchema = tripDetailsFormSchema.extend({ city: pickedPlaceSchema });

/** Form and submit flow for the new-trip form; navigates to the editor once the trip is created. */
export function useNewTripForm() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const form = useForm({
    resolver: zodResolver(newTripFormSchema),
    mode: "onChange",
    defaultValues: { title: "", coverImage: null },
  });

  const onSubmit = form.handleSubmit(({ title, coverImage, city }) => {
    createTrip.mutate(
      {
        title,
        // New trips only ever hold a local file.
        coverImage: coverImage instanceof File ? coverImage : null,
        city: { placeId: city.placeId, sessionToken: city.sessionToken },
      },
      { onSuccess: (trip) => router.push(`/editor/${trip.id}`) },
    );
  });

  return {
    form,
    onSubmit,
    isPending: createTrip.isPending,
    isError: createTrip.isError,
  };
}
