import { useState, type ReactElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { render as rtlRender } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { trpc } from "@/lib/trpc/client";

/** Fresh tRPC + React Query context per render so hooks like `useUploadTripImage` can mount. Requests are never sent; mock `@/lib/api/*` to control results. */
function TestProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({ links: [httpBatchLink({ url: "http://localhost/api/trpc" })] }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

/** Renders `ui` and returns a ready-to-use `user` session alongside the usual RTL utilities. */
function render(ui: ReactElement) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, { wrapper: TestProviders }),
  };
}

export * from "@testing-library/react";
export { render };
