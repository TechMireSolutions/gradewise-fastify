"use client";

import { Label, Select } from "@/components/ui";
import { modelOptions, providerLabels } from "../hooks/useSuperAdminApiConfig.js";

export default function ModelSelector({
  provider,
  model,
  onChangeModel,
  disabled = false,
}) {
  const options = modelOptions[provider] || [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="model-select">Active Model for {providerLabels[provider]}</Label>
        <span className="text-xs font-mono text-muted-foreground">{model}</span>
      </div>
      <Select
        id="model-select"
        value={model}
        onChange={(e) => onChangeModel(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      <p className="text-xs text-muted-foreground">
        Changing the model will take effect immediately for all subsequent assessment operations.
      </p>
    </div>
  );
}
