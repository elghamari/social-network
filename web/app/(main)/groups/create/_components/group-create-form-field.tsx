interface GroupCreateFormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export default function GroupCreateFormField({
  label,
  error,
  children,
}: GroupCreateFormFieldProps) {
  return (
    <div className="group-form__field">
      <label className="group-form__label">{label}</label>
      {children}
      {error && <span className="group-form__error">{error}</span>}
    </div>
  );
}
