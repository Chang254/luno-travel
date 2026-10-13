import * as flags from "country-flag-icons/string/3x2";

const ISO_CODE = /^[A-Z]{2}$/;

/**
 * Serves `/flags/JP.svg` etc. Every flag is prerendered at build so they're
 * CDN-cached static files rather than ~1MB of SVG bundled into client JS.
 */
export function generateStaticParams() {
  return Object.keys(flags)
    .filter((code) => ISO_CODE.test(code))
    .map((code) => ({ file: `${code}.svg` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const svg = flags[file.replace(/\.svg$/, "") as keyof typeof flags];

  if (!svg) return new Response(null, { status: 404 });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
