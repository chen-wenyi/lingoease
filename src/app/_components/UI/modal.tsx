"use client";

import { type ReactNode } from "react";

type ModalProps = {
  children?: ReactNode;
};

export function ModalButton({ children }: ModalProps) {
  const openModal = () => {
    const dialog = document.getElementById("my_modal_2") as HTMLDialogElement;
    dialog?.showModal();
  };

  return (
    <>
      <button className="btn" onClick={openModal}>
        Setup your ApiKey
      </button>
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">OpenAI ApiKey Setup</h3>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">A label of your ApiKey</legend>
            <input type="text" className="input" placeholder="e.g. apikey1" />

            <legend className="fieldset-legend">What is your ApiKey?</legend>
            <input
              type="text"
              className="input"
              placeholder="input your api key"
            />
          </fieldset>
          <button className="btn btn-neutral">Confirm</button>

          {/* <p className="py-4"></p> */}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      {children}
    </>
  );
}
