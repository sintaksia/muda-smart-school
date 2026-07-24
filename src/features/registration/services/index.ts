// Export semua dari registration service
export * from "./registration.service";

// Export semua dari registration schema
export * from "./registration.schema";

// Re-export types dari Prisma
export type {
  Registration,
  Gender,
  Specialization,
  Education,
  RegistrationStatus,
} from "@prisma/client";

// Export interfaces yang sering digunakan
export type {
  CreateRegistrationInput,
  UpdateRegistrationInput,
} from "./registration.service";

export type { RegistrasiFormData } from "./registration.schema";

// Export utils
export * from "./registration.utils";
