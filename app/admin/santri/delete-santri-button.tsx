"use client";

import { deleteSantriAction } from "./actions";

export function DeleteSantriButton({ id, nama }: { id: string; nama: string }) {
  return (
    <form
      action={deleteSantriAction.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`Hapus data santri "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) {
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
