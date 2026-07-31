import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary-600 text-white font-bold text-xl">
            M
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
        <CardDescription>
          Masuk ke panel admin Muda Smart School
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
