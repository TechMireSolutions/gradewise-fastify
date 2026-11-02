import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ALL_PROVIDERS,
  defaultModelMap,
  providerLabels,
  PROVIDER_META,
  detectProvider,
  providerTheme,
} from "./constants/superAdminConstants.js";
import { formatRole, getRoleBadgeColor, getRoleAvatarBg } from "../../utils/roleDisplay.js";

describe("Super Admin AI Configuration Provider Metadata", () => {
  it("defines all 6 supported AI providers", () => {
    assert.deepEqual(ALL_PROVIDERS, ["gemini", "groq", "openai", "claude", "mistral", "deepseek"]);
    assert.equal(ALL_PROVIDERS.length, 6);
  });

  it("contains valid default models for all 6 providers", () => {
    for (const provider of ALL_PROVIDERS) {
      assert.ok(defaultModelMap[provider], `Missing default model for ${provider}`);
      assert.equal(typeof defaultModelMap[provider], "string");
      assert.ok(defaultModelMap[provider].length > 0);
    }
  });

  it("contains human-friendly labels for each provider", () => {
    assert.equal(providerLabels.gemini, "Google Gemini");
    assert.equal(providerLabels.groq, "Groq AI");
    assert.equal(providerLabels.openai, "OpenAI");
    assert.equal(providerLabels.claude, "Anthropic Claude");
    assert.equal(providerLabels.mistral, "Mistral AI");
    assert.equal(providerLabels.deepseek, "DeepSeek");
  });

  it("provides comprehensive metadata and documentation URLs for every provider", () => {
    for (const provider of ALL_PROVIDERS) {
      const meta = PROVIDER_META[provider];
      assert.ok(meta, `Missing PROVIDER_META for ${provider}`);
      assert.ok(meta.name);
      assert.ok(meta.badge);
      assert.ok(meta.tagline);
      assert.ok(meta.description);
      assert.ok(meta.docsUrl.startsWith("https://"));
    }
  });
});

describe("Super Admin detectProvider Utility", () => {
  it("detects Gemini keys by AIza or AQ. prefixes", () => {
    assert.equal(detectProvider("AIzaSyD-abc1234567"), "gemini");
    assert.equal(detectProvider("AQ.xyz987654"), "gemini");
  });

  it("detects Anthropic Claude keys by sk-ant- prefix", () => {
    assert.equal(detectProvider("sk-ant-api03-abcdef"), "claude");
  });

  it("detects Groq keys by gsk_ prefix", () => {
    assert.equal(detectProvider("gsk_1234567890abcdef"), "groq");
  });

  it("detects OpenAI keys by sk-proj- or sk- prefixes", () => {
    assert.equal(detectProvider("sk-proj-abc123xyz"), "openai");
    assert.equal(detectProvider("sk-svcacct-test"), "openai");
    assert.equal(detectProvider("sk-standardkeyhere"), "openai");
  });

  it("detects Mistral 32-character hexadecimal keys", () => {
    assert.equal(detectProvider("0123456789abcdef0123456789abcdef"), "mistral");
  });

  it("returns null for empty, falsy, or unrecognized strings", () => {
    assert.equal(detectProvider(""), null);
    assert.equal(detectProvider(null), null);
    assert.equal(detectProvider(undefined), null);
    assert.equal(detectProvider("random_string_not_a_key"), null);
  });
});

describe("Super Admin RBAC & Role Formatting", () => {
  it("formats super_admin role cleanly", () => {
    assert.equal(formatRole("super_admin"), "Super Admin");
  });

  it("provides distinct purple badge styling for super_admin", () => {
    const badge = getRoleBadgeColor("super_admin");
    assert.ok(badge.includes("purple"));
  });

  it("provides distinct avatar gradient for super_admin", () => {
    const avatar = getRoleAvatarBg("super_admin");
    assert.ok(avatar.includes("purple") || avatar.includes("violet"));
  });
});

describe("Super Admin Analytics Calculation Edge Cases", () => {
  it("calculates execution rate safely without NaN or division by zero", () => {
    const calcRate = (executed, total) => (total > 0 ? Math.round((executed / total) * 100) : 0);
    assert.equal(calcRate(0, 0), 0);
    assert.equal(calcRate(0, 10), 0);
    assert.equal(calcRate(5, 10), 50);
    assert.equal(calcRate(10, 10), 100);
  });

  it("calculates completion rate safely with zero attempts", () => {
    const calcCompletion = (completed, total) => (total > 0 ? Math.round((completed / total) * 100) : 0);
    assert.equal(calcCompletion(0, 0), 0);
    assert.equal(calcCompletion(3, 4), 75);
    assert.equal(calcCompletion(12, 12), 100);
  });
});

describe("Super Admin Provider Theme Integration", () => {
  it("defines providerTheme for all 6 providers", () => {
    for (const provider of ALL_PROVIDERS) {
      assert.ok(providerTheme[provider], `Missing providerTheme for ${provider}`);
      assert.ok(providerTheme[provider].dot);
      assert.ok(providerTheme[provider].badge);
      assert.ok(providerTheme[provider].activeSidebar);
      assert.ok(providerTheme[provider].panelGradient);
      assert.ok(providerTheme[provider].accentBg);
    }
  });

  it("binds provider badges to centralized statusTone palette", () => {
    assert.match(providerTheme.gemini.badge, /indigo/);
    assert.match(providerTheme.groq.badge, /amber/);
    assert.match(providerTheme.openai.badge, /emerald/);
    assert.match(providerTheme.claude.badge, /purple/);
    assert.match(providerTheme.mistral.badge, /red/);
    assert.match(providerTheme.deepseek.badge, /sky/);
  });
});
