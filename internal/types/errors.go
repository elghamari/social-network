package types

type ValidationError struct {
	Fields map[string]string
}

func (v ValidationError) Error() string {
	return "validation error"
}
