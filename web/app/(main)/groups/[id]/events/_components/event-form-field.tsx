interface EventFormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export default function EventFormField({
  label,
  error,
  children,
}: EventFormFieldProps) {
  return (
    <div className="ef-field">
      <label className="ef-field__label">{label}</label>
      {children}
      {error && <span className="ef-field__error">{error}</span>}
    </div>
  );
}
