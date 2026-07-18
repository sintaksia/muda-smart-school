import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface CreateButtonProps {
  href: string;
  label: string;
}

export function CreateButton({ href, label }: CreateButtonProps) {
  return (
    <Button asChild>
      <Link href={href}>
        <Plus className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}
