import test from "node:test";
import assert from "node:assert/strict";
import { getRoleBadgeColor, getRoleAvatarBg, formatRole } from "./roleDisplay.js";

test("getRoleBadgeColor", async (t) => {
  await t.test("returns purple styling for super_admin", () => {
    assert.match(getRoleBadgeColor("super_admin"), /purple/);
  });

  await t.test("returns red styling for admin", () => {
    assert.match(getRoleBadgeColor("admin"), /red/);
  });

  await t.test("returns blue styling for instructor", () => {
    assert.match(getRoleBadgeColor("instructor"), /blue/);
  });

  await t.test("returns emerald styling for student", () => {
    assert.match(getRoleBadgeColor("student"), /emerald/);
  });

  await t.test("returns muted fallback for unknown role", () => {
    assert.match(getRoleBadgeColor("other"), /muted/);
    assert.match(getRoleBadgeColor(null), /muted/);
  });
});

test("getRoleAvatarBg", async (t) => {
  await t.test("returns gradient for each known role", () => {
    assert.match(getRoleAvatarBg("super_admin"), /purple/);
    assert.match(getRoleAvatarBg("admin"), /red/);
    assert.match(getRoleAvatarBg("instructor"), /indigo/);
    assert.match(getRoleAvatarBg("student"), /emerald/);
  });

  await t.test("returns slate fallback for unknown role", () => {
    assert.match(getRoleAvatarBg("guest"), /slate/);
    assert.match(getRoleAvatarBg(null), /slate/);
  });
});

test("formatRole", async (t) => {
  await t.test("formats snake_case roles to Title Case", () => {
    assert.strictEqual(formatRole("super_admin"), "Super Admin");
    assert.strictEqual(formatRole("admin"), "Admin");
    assert.strictEqual(formatRole("instructor"), "Instructor");
    assert.strictEqual(formatRole("student"), "Student");
  });

  await t.test("returns Unknown when role is null or undefined", () => {
    assert.strictEqual(formatRole(null), "Unknown");
    assert.strictEqual(formatRole(undefined), "Unknown");
    assert.strictEqual(formatRole(""), "Unknown");
  });
});
