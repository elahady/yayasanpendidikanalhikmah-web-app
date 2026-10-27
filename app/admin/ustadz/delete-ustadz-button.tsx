"use client";

import { deleteUstadzAction } from "./actions";

export function DeleteUstadzButton({ id, nama }: { id: string; nama: string }) {
  return (
    <form
      action={deleteUstadzAction.bind(null, id)}
      onSubmit={(event) => {
        if (
          !window.confirm(`Hapus data ustadz/ustadzah "${nama}"? Tindakan ini tidak bisa dibatalkan.`)
        ) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
      >
        Hapus
      </button>
    </form>
  );
}
