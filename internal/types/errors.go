package types

type FormError struct {
	Fields map[string]string
}

func (e FormError) Error() string {
	return "form error"
}

func NewFormError() FormError {
	return FormError{
		Fields: make(map[string]string),
	}
}

type ActionError struct {
	Message string
}

func (e ActionError) Error() string {
	return "action error"
}

func NewActionError(message string) ActionError {
	return ActionError{
		Message: message,
	}
}
