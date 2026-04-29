// group-form-field.tsx
interface Props {
  label: string;
  errors?: string[];
  children: React.ReactNode;
}

export default function GroupFormField({ label, errors, children }: Props) {
  return (
    <div className="gf-modal__field">
      <label className="gf-modal__label">{label}</label>
      {children}
      {errors &&
        errors.length > 0 &&
        errors.map((err, i) => (
          <span key={i} className="gf-modal__error">
            {err}
          </span>
        ))}
    </div>
  );
}
