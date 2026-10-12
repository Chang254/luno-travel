import { render, screen } from "@/lib/test-utils";

import TripReader from "./TripReader";

function paragraph(text: string) {
  return {
    type: "paragraph",
    version: 1,
    direction: null,
    format: "",
    indent: 0,
    textFormat: 0,
    textStyle: "",
    children: [
      { type: "text", version: 1, text, format: 0, style: "", mode: "normal", detail: 0 },
    ],
  };
}

const content = {
  root: {
    type: "root",
    version: 1,
    direction: null,
    format: "",
    indent: 0,
    children: [
      paragraph("Temples at dawn"),
      { type: "image", version: 1, src: "user-1/trip-1/kyoto.png", alt: "kyoto", width: 400, align: "" },
    ],
  },
};

describe("TripReader", () => {
  it("renders the title and saved content", async () => {
    render(<TripReader title="Kyoto" content={content} />);

    expect(screen.getByRole("heading", { name: "Kyoto" })).toBeInTheDocument();
    expect(await screen.findByText("Temples at dawn")).toBeInTheDocument();
  });

  it("does not let readers edit the content", async () => {
    render(<TripReader title="Kyoto" content={content} />);

    await screen.findByText("Temples at dawn");
    expect(screen.getByRole("textbox")).toHaveAttribute("contenteditable", "false");
  });

  it("shows images without the editor's resize handle", async () => {
    render(<TripReader title="Kyoto" content={content} />);

    expect(await screen.findByRole("img", { name: "kyoto" })).toBeInTheDocument();
    expect(screen.queryByTitle(/drag to resize/i)).not.toBeInTheDocument();
  });

  it("shows the cover image when there is one", () => {
    render(<TripReader title="Kyoto" coverImagePath="user-1/trip-1/cover.png" content={content} />);

    expect(screen.getByRole("img", { name: "Cover photo for Kyoto" })).toHaveAttribute(
      "src",
      expect.stringContaining("user-1/trip-1/cover.png"),
    );
  });
});
