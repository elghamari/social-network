import { RegisterFieldErrors } from "@/app/lib/types/auth";

interface RegisterFieldProps {
  label: string;
  name: keyof RegisterFieldErrors;
  type?: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  errors?: string[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  textarea?: boolean;
}

export function RegisterField({
  label,
  name,
  type = "text",
  required = false,
  value,
  placeholder,
  errors,
  onChange,
  textarea = false,
}: RegisterFieldProps) {
  const hasError = Boolean(errors?.length);

  return (
    <div className="register-field">
      <label className="register-label">{label}</label>

      {textarea ? (
        <textarea
          name={name}
          rows={5}
          className={`register-input register-textarea ${hasError ? "register-input--error" : ""}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          className={`register-input ${hasError ? "register-input--error" : ""}`}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}

      {hasError && (
        <div className="register-field-errors">
          {errors!.map((msg, i) => (
            <span key={i} className="register-field-error">
              {msg}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
