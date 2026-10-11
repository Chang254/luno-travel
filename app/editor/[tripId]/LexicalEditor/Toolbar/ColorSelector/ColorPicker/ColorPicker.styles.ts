export const styles = {
  container: "flex flex-col gap-3 p-2",
  svBox:
    "relative h-32 w-full touch-none rounded-md [background-image:linear-gradient(to_top,#000,transparent),linear-gradient(to_right,#fff,transparent)]",
  svThumb:
    "pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ring-1 ring-black/30",
  hueBar:
    "relative h-3 w-full touch-none rounded-full [background-image:linear-gradient(to_right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)]",
  hueThumb:
    "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ring-1 ring-black/30",
  hexInput:
    "h-8 w-full rounded-md border border-input bg-background px-2 text-sm uppercase outline-none focus-visible:ring-1 focus-visible:ring-ring",
};
