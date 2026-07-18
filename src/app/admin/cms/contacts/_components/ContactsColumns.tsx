"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/src/app/admin/_components/SortableHeader";
import { StatusBadge } from "@/src/app/admin/_components/StatusBadge";
import { ContactActions } from "./ContactsActions";
import { indexColumn } from "@/src/app/admin/_components/indexColumn";
import { contactTypes } from "./ContactsSchema";
import type { Contact } from "@/src/features/cms/services/contacts";

const getContactIcon = (contactType: string | null) => {
  const type = contactTypes.find((t) => t.value === contactType);
  if (!type) return null;
  const Icon = type.icon;
  return <Icon className="h-3 w-3" />;
};

const getContactLabel = (contactType: string | null) => {
  if (!contactType) return null;
  return (
    contactTypes.find((m) => m.value === contactType)?.label || contactType
  );
};

const getContactColor = (contactType: string | null) => {
  switch (contactType) {
    case "WHATSAPP":
      return "text-white bg-green-500";
    case "PHONE":
      return "text-white bg-green-700";
    case "EMAIL":
      return "text-white bg-red-500";
    default:
      return "";
  }
};

export const contactsColumns: ColumnDef<Contact>[] = [
  indexColumn<Contact>(),
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} label="Nama" />,
  },
  {
    accessorKey: "value",
    header: "Nomor / Email",
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortableHeader column={column} label="Tipe" />,
    cell: ({ row }) => {
      const contactType = row.original.type;
      if (!contactType) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getContactColor(
            contactType,
          )}`}
        >
          {getContactIcon(contactType)}
          {getContactLabel(contactType)}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <StatusBadge isActive={row.original.isActive} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ContactActions contact={row.original} />,
  },
];
