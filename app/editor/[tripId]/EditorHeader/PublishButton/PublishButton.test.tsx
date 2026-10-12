import { render, screen, waitFor, within } from "@/lib/test-utils";
import {
  usePublication,
  usePublishTrip,
  useUnpublishTrip,
  useUpdateTripContent,
} from "@/lib/api/trips";

import { useEditorSaveStore } from "../../EditorSaveStore.store";
import PublishButton from "./PublishButton";

jest.mock("@/lib/api/trips");
jest.mock("../../EditorSaveStore.store");

const mockEditor = {
  getEditorState: () => ({ toJSON: () => ({ root: {} }) }),
};

function setup({
  publication,
  isDirty = false,
  saveResult = Promise.resolve({}),
}: {
  publication: unknown;
  isDirty?: boolean;
  saveResult?: Promise<unknown>;
}) {
  const markSaved = jest.fn();
  jest.mocked(useEditorSaveStore).mockImplementation((selector) =>
    selector({
      editor: mockEditor,
      isDirty,
      setEditor: jest.fn(),
      markDirty: jest.fn(),
      markSaved,
    } as unknown as Parameters<typeof selector>[0]),
  );
  const saveDraft = jest.fn().mockReturnValue(saveResult);
  jest.mocked(useUpdateTripContent).mockReturnValue({
    mutateAsync: saveDraft,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateTripContent>);
  jest.mocked(usePublication).mockReturnValue({
    data: publication,
  } as unknown as ReturnType<typeof usePublication>);
  const publish = jest.fn();
  jest.mocked(usePublishTrip).mockReturnValue({
    mutate: publish,
    isPending: false,
  } as unknown as ReturnType<typeof usePublishTrip>);
  const unpublish = jest.fn();
  jest.mocked(useUnpublishTrip).mockReturnValue({
    mutate: unpublish,
    isPending: false,
  } as unknown as ReturnType<typeof useUnpublishTrip>);

  return { saveDraft, markSaved, publish, unpublish };
}

/** Opens the confirmation from the header button and confirms it. */
async function confirmPublish(user: ReturnType<typeof render>["user"], label = "Publish") {
  await user.click(screen.getByRole("button", { name: label }));
  const dialog = await screen.findByRole("alertdialog");
  await user.click(within(dialog).getByRole("button", { name: label }));
}

describe("PublishButton", () => {
  it("offers to publish a trip that hasn't been published", () => {
    setup({ publication: null });

    render(<PublishButton tripId="trip-1" initiallyPublished={false} />);

    expect(screen.getByRole("button", { name: "Publish" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Publishing options" })).not.toBeInTheDocument();
  });

  it("offers to update a published trip", () => {
    setup({ publication: { trip_id: "trip-1" } });

    render(<PublishButton tripId="trip-1" initiallyPublished={false} />);

    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });

  it("asks for confirmation before publishing", async () => {
    const { publish } = setup({ publication: null });

    const { user } = render(<PublishButton tripId="trip-1" initiallyPublished={false} />);
    await user.click(screen.getByRole("button", { name: "Publish" }));

    expect(await screen.findByRole("alertdialog", { name: "Publish this trip?" })).toBeInTheDocument();
    expect(publish).not.toHaveBeenCalled();
  });

  it("does not publish when the confirmation is cancelled", async () => {
    const { publish } = setup({ publication: null });

    const { user } = render(<PublishButton tripId="trip-1" initiallyPublished={false} />);
    await user.click(screen.getByRole("button", { name: "Publish" }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(publish).not.toHaveBeenCalled();
  });

  it("confirms an update to an already published trip", async () => {
    const { publish } = setup({ publication: { trip_id: "trip-1" } });

    const { user } = render(<PublishButton tripId="trip-1" initiallyPublished />);
    await user.click(screen.getByRole("button", { name: "Update" }));
    expect(
      await screen.findByRole("alertdialog", { name: "Update the published trip?" }),
    ).toBeInTheDocument();
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Update" }));

    expect(publish).toHaveBeenCalledWith({ id: "trip-1" });
  });

  it("publishes straight away when there are no unsaved changes", async () => {
    const { saveDraft, publish } = setup({ publication: null });

    const { user } = render(<PublishButton tripId="trip-1" initiallyPublished={false} />);
    await confirmPublish(user);

    expect(saveDraft).not.toHaveBeenCalled();
    expect(publish).toHaveBeenCalledWith({ id: "trip-1" });
  });

  it("saves unsaved changes before publishing", async () => {
    const { saveDraft, markSaved, publish } = setup({ publication: null, isDirty: true });

    const { user } = render(<PublishButton tripId="trip-1" initiallyPublished={false} />);
    await confirmPublish(user);

    expect(saveDraft).toHaveBeenCalledWith({ id: "trip-1", content: { root: {} } });
    await waitFor(() => expect(publish).toHaveBeenCalledWith({ id: "trip-1" }));
    expect(markSaved).toHaveBeenCalled();
  });

  it("does not publish when saving the changes fails", async () => {
    const { publish } = setup({
      publication: null,
      isDirty: true,
      saveResult: Promise.reject(new Error("db down")),
    });

    const { user } = render(<PublishButton tripId="trip-1" initiallyPublished={false} />);
    await confirmPublish(user);

    expect(publish).not.toHaveBeenCalled();
  });

  it("unpublishes from the publishing options menu", async () => {
    const { unpublish } = setup({ publication: { trip_id: "trip-1" } });

    const { user } = render(<PublishButton tripId="trip-1" initiallyPublished />);
    await user.click(screen.getByRole("button", { name: "Publishing options" }));
    await user.click(await screen.findByRole("menuitem", { name: "Unpublish" }));

    expect(unpublish).toHaveBeenCalledWith({ id: "trip-1" });
  });

  it("links to the live trip from the publishing options menu", async () => {
    setup({ publication: { trip_id: "trip-1" } });

    const { user } = render(<PublishButton tripId="trip-1" initiallyPublished />);
    await user.click(screen.getByRole("button", { name: "Publishing options" }));

    expect(await screen.findByRole("menuitem", { name: "View live" })).toHaveAttribute(
      "href",
      "/trips/trip-1",
    );
  });
});
