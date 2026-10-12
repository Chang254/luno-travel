/** @jest-environment node */

import { getBaseUrl } from "./utils";

describe("getBaseUrl", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  });

  afterAll(() => {
    process.env = env;
  });

  it("uses the production domain in production, not the protected deployment URL", () => {
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_URL = "luno-travel-abc123-team.vercel.app";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "luno-travel.vercel.app";

    expect(getBaseUrl()).toBe("https://luno-travel.vercel.app");
  });

  it("uses the deployment URL for previews", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "luno-travel-abc123-team.vercel.app";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "luno-travel.vercel.app";

    expect(getBaseUrl()).toBe("https://luno-travel-abc123-team.vercel.app");
  });

  it("falls back to localhost outside Vercel", () => {
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });
});
