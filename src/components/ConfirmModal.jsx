export default function ConfirmModal({ onConfirm, onCancel }) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-lg w-96">
          <h2 className="text-lg font-semibold mb-4">Are you sure?</h2>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    );
  }
