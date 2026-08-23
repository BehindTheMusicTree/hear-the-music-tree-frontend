import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /health", () => {
  it("returns a 200 status with the expected JSON body", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
