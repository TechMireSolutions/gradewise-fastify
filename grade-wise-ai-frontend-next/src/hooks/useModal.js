import { useState, useCallback } from "react";

const INITIAL_MODAL = { isOpen: false, type: "info", title: "", message: "" };

export default function useModal() {
  const [modal, setModal] = useState(INITIAL_MODAL);

  const showModal = useCallback((type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  }, []);

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return { modal, showModal, closeModal };
}
