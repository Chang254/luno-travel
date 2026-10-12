import { getInitials, getUserProfile } from "./userProfile";

describe("getUserProfile", () => {
  it("uses the Google full name and avatar", () => {
    const profile = getUserProfile({
      email: "ada@example.com",
      user_metadata: {
        full_name: "Ada Lovelace",
        name: "Ada",
        avatar_url: "https://example.com/a.png",
        picture: "https://example.com/p.png",
      },
    });

    expect(profile).toEqual({ name: "Ada Lovelace", avatarUrl: "https://example.com/a.png" });
  });

  it("falls back to name and picture", () => {
    const profile = getUserProfile({
      user_metadata: { name: "Ada", picture: "https://example.com/p.png" },
    });

    expect(profile).toEqual({ name: "Ada", avatarUrl: "https://example.com/p.png" });
  });

  it("falls back to the email when no name is set", () => {
    expect(getUserProfile({ email: "ada@example.com", user_metadata: { full_name: " " } })).toEqual(
      { name: "ada@example.com", avatarUrl: null },
    );
  });

  it("returns nulls when nothing is available", () => {
    expect(getUserProfile({})).toEqual({ name: null, avatarUrl: null });
  });
});

describe("getInitials", () => {
  it("takes the first and last word", () => {
    expect(getInitials("ada king lovelace")).toBe("AL");
  });

  it("uses a single initial for one word", () => {
    expect(getInitials("ada@example.com")).toBe("A");
  });

  it("returns an empty string without a name", () => {
    expect(getInitials(null)).toBe("");
  });
});
