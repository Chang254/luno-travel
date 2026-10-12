/** @jest-environment node */

import { fetchImageDataUrl } from "./ogImage.helpers";

function mockFetch(response: Partial<Response> | Error) {
  global.fetch = jest.fn(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response as Response),
  );
}

function imageResponse(contentType: string, ok = true): Partial<Response> {
  return {
    ok,
    headers: new Headers({ "content-type": contentType }),
    arrayBuffer: () => Promise.resolve(new TextEncoder().encode("img").buffer),
  };
}

describe("fetchImageDataUrl", () => {
  it("returns a data URL for a supported image", async () => {
    mockFetch(imageResponse("image/jpeg; charset=binary"));

    await expect(fetchImageDataUrl("https://example.com/a.jpg")).resolves.toBe(
      "data:image/jpeg;base64,aW1n",
    );
  });

  it("skips formats ImageResponse can't render", async () => {
    mockFetch(imageResponse("image/webp"));

    await expect(fetchImageDataUrl("https://example.com/a.webp")).resolves.toBeNull();
  });

  it("returns null for a failed response", async () => {
    mockFetch(imageResponse("image/png", false));

    await expect(fetchImageDataUrl("https://example.com/a.png")).resolves.toBeNull();
  });

  it("returns null when the fetch throws", async () => {
    mockFetch(new Error("network"));

    await expect(fetchImageDataUrl("https://example.com/a.png")).resolves.toBeNull();
  });

  it("returns null without a url", async () => {
    await expect(fetchImageDataUrl(null)).resolves.toBeNull();
  });
});
