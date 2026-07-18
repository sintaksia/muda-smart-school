"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseCmsFormSubmitOptions {
  apiPath: string;
  id?: string;
  listPath: string;
  createdMessage: string;
  updatedMessage: string;
  errorMessage: string;
}

/**
 * Shared create/update submit handler for CMS entity forms: builds the
 * PUT/POST request, shows the success/error toast, and redirects back to
 * the list page. Every `[Feature]Form.tsx` wraps this instead of
 * re-implementing the same fetch/toast/redirect boilerplate.
 */
export function useCmsFormSubmit<T>({
  apiPath,
  id,
  listPath,
  createdMessage,
  updatedMessage,
  errorMessage,
}: UseCmsFormSubmitOptions) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!id;

  const submit = async (data: T) => {
    setIsLoading(true);
    try {
      const url = isEditing ? `${apiPath}/${id}` : apiPath;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(errorMessage);
      }

      toast.success(isEditing ? updatedMessage : createdMessage);
      router.push(listPath);
      router.refresh();
    } catch {
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, isEditing };
}
