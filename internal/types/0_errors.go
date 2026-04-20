package types

type FormError struct {
	Fields map[string]string
}

func NewFormError() *FormError {
	return &FormError{
		Fields: make(map[string]string),
	}
}

func (e FormError) Error() string {
	return "form error"
}

func (e *FormError) HasErrors() bool {
	return len(e.Fields) > 0
}

type ActionError struct {
	Message string
}

func NewActionError() *ActionError {
	return &ActionError{}
}

func (e ActionError) Error() string {
	return "action error"
}

func (e *ActionError) HasErrors() bool {
	return len(e.Message) > 0
}
