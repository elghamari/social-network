import { RegisterForm } from "@/app/ui/auth/register-form";



export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
        
        <RegisterForm />
        
      </div>
    </main>
  );
}