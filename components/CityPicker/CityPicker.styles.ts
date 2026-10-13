export const styles = {
  root: "h-auto w-auto min-w-0 overflow-visible bg-transparent",
  field: "relative min-w-0",
  icon: "pointer-events-none absolute text-sm top-1/2 left-2.5 flex -translate-y-1/2 text-muted-foreground [&_svg]:size-4",
  input: "pl-8",
  content: "w-[var(--radix-popover-trigger-width)] min-w-72 p-0",
  /** `group` so the icon and detail can follow the highlight; muted text matches the accent background. */
  option: "group",
  optionIcon: "text-muted-foreground group-data-[selected=true]:text-accent-foreground",
  suggestion: "flex min-w-0 flex-col items-start gap-0",
  suggestionDetail:
    "truncate text-xs text-muted-foreground group-data-[selected=true]:text-accent-foreground/80",
  status: "py-6 text-center text-sm text-muted-foreground",
  attribution: "border-t px-3 py-1.5 text-right text-[10px] text-muted-foreground",
};
