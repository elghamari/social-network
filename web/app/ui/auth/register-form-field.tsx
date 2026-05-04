// app/ui/auth/register-form-field.tsx
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
    <div className="auth-field">
      <label className="auth-label">{label}</label>

      {textarea ? (
        <textarea
          name={name}
          rows={5}
          className={`auth-input auth-textarea ${hasError ? "auth-input--error" : ""}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          className={`auth-input ${hasError ? "auth-input--error" : ""}`}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}

      {hasError && (
        <div className="auth-field-errors">
          {errors!.map((msg, i) => (
            <span key={i} className="auth-field-error">
              {msg}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
