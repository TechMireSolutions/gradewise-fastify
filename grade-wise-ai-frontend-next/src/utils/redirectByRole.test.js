import test from "node:test";
import assert from "node:assert/strict";
import { getDestinationRoute, redirectByRole } from "./redirectByRole.js";

test("getDestinationRoute", async (t) => {
  await t.test("returns /super-admin/dashboard for super_admin", () => {
    assert.strictEqual(getDestinationRoute("super_admin"), "/super-admin/dashboard");
  });

  await t.test("returns /admin/dashboard for admin", () => {
    assert.strictEqual(getDestinationRoute("admin"), "/admin/dashboard");
  });

  await t.test("returns /instructor/dashboard for instructor", () => {
    assert.strictEqual(getDestinationRoute("instructor"), "/instructor/dashboard");
  });

  await t.test("returns /student/dashboard for student", () => {
    assert.strictEqual(getDestinationRoute("student"), "/student/dashboard");
  });

  await t.test("returns /profile fallback for unknown or missing role", () => {
    assert.strictEqual(getDestinationRoute(null), "/profile");
    assert.strictEqual(getDestinationRoute(undefined), "/profile");
    assert.strictEqual(getDestinationRoute("guest"), "/profile");
  });
});

test("redirectByRole", async (t) => {
  await t.test("calls navigate callback with correct destination", () => {
    let redirectedTo = null;
    const mockNavigate = (path) => {
      redirectedTo = path;
    };

    redirectByRole("instructor", mockNavigate);
    assert.strictEqual(redirectedTo, "/instructor/dashboard");

    redirectByRole("student", mockNavigate);
    assert.strictEqual(redirectedTo, "/student/dashboard");
  });
});
