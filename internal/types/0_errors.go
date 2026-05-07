package types

type  FormError struct {
	Fields map[string][]string
}

func NewFormError() *FormError {
	return &FormError{
		Fields: make(map[string][]string),
	}
}

func (e *FormError) Error() string {
	return "form error"
}

func (e *FormError) HasErrors() bool {
	for _, errs := range e.Fields {
		if len(errs) > 0 {
			return true
		}
	}
	return false
}

type ActionError struct {
	Message string
}

func NewActionError(msg string) *ActionError {
	return &ActionError{Message: msg}
}

func (e *ActionError) Error() string {
	return e.Message
}

func (e *ActionError) HasErrors() bool {
	return len(e.Message) > 0
}

type NotFoundError struct {
	Message string
}

func NewNotFoundError(msg string) *NotFoundError {
	return &NotFoundError{Message: msg}
}

func (e *NotFoundError) Error() string {
	return e.Message
}

type ForbiddenError struct {
	Message string
}

func NewForbiddenError(msg string) *ForbiddenError {
	return &ForbiddenError{Message: msg}
}

func (e *ForbiddenError) Error() string {
	return e.Message
}
