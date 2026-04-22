import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

export default function GroupFormActions() {
  const router = useRouter();
  const { pending } = useFormStatus();

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
        disabled={pending}
      >
        {pending ? (
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
