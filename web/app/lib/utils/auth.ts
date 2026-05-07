import { RegisterInput, RegisterFieldErrors } from "@/app/lib/types/auth";

export const validateRegister = (input: RegisterInput): RegisterFieldErrors => {
  const newErrors: RegisterFieldErrors = {};

  // First Name
  if (!input.first_name.trim()) {
    newErrors.first_name = ["First name is required"];
  }

  // Last Name
  if (!input.last_name.trim()) {
    newErrors.last_name = ["Last name is required"];
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email) {
    newErrors.email = ["Email is required"];
  } else if (!emailRegex.test(input.email)) {
    newErrors.email = ["Invalid email format"];
  }

  // Password
  if (!input.password) {
    newErrors.password = ["Password is required"];
  } else if (input.password.length < 6) {
    newErrors.password = ["Password must be at least 6 characters"];
  }

  // Date of Birth
  if (!input.date_of_birth) {
    newErrors.date_of_birth = ["Date of birth is required"];
  } else {
    const birthDate = new Date(input.date_of_birth);
    const today = new Date();
    if (birthDate > today) {
      newErrors.date_of_birth = ["Date of birth cannot be in the future"];
    }
  }

  return newErrors;
};