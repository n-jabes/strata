"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type DeleteFarmButtonProps = {
  deleteAction: () => Promise<void>;
};

export function DeleteFarmButton({ deleteAction }: DeleteFarmButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
      >
        Delete Farm
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delete farm confirmation"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete this farm?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This action cannot be undone. All analyses associated with this farm
              may also be removed.
            </p>

            <form action={deleteAction} className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, delete farm
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

