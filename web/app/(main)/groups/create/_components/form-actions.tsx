import { useRouter } from "next/navigation";

export default function FormActions({ loading }: { loading: boolean }) {
  const router = useRouter();

  return (
    <div className="group-form__actions">
      <button
        type="button"
        className="group-form__btn group-form__btn--cancel"
        onClick={() => {
          router.push("/groups");
        }}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="group-form__btn group-form__btn--submit"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="group-form__spinner" />
            Creating...
          </>
        ) : (
          "Create Group"
        )}
      </button>
    </div>
  );
}
