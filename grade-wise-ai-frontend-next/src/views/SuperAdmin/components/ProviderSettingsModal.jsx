"use client";

import AddNewLlmModal from "./AddNewLlmModal.jsx";

export default function ProviderSettingsModal(props) {
  return (
    <AddNewLlmModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      initialPurpose={props.purpose}
      initialProvider={props.provider}
      initialStep={props.initialStep || 1}
      aiState={props.aiState}
      configLoading={props.configLoading}
      onSaveLlm={props.onSaveLlm || props.onSaveCard}
      onSaveCard={props.onSaveCard}
      onTestInlineKey={props.onTestInlineKey}
      totalPdfKeys={props.totalPdfKeys}
      totalTextKeys={props.totalTextKeys}
    />
  );
}
