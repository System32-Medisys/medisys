import { expect, it, vi } from "vitest";
const destroySession = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({ destroySession }));
import { POST } from "./route";

it("clears the session and redirects POST to a GET login page", async () => {
  const response = await POST(new Request("http://localhost/api/auth/logout", { method: "POST" }));
  expect(destroySession).toHaveBeenCalledOnce();
  expect(response.status).toBe(303);
  expect(response.headers.get("location")).toBe("http://localhost/login");
});
