import { useFormStatus } from "react-dom";

export default function SubmitBtn() {
  const { pending } = useFormStatus();

  return (
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
  );
}
