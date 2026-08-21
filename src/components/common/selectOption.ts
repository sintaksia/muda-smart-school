/**
 * The option shape every dropdown in the app speaks — `SelectField`,
 * `FormSelect` and their searchable variant alike. Lives on its own so the
 * plain and searchable implementations can share it without importing each
 * other. — docs/design_system.md §6.1
 */
export interface SelectOption {
  value: string;
  label: string;
}
