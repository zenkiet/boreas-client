import { RegistryCredential } from './registry-credential';

/** Structurally a `GlassSelectOption`; spelled out here so the model stays free of UI imports. */
interface CredentialOption {
  readonly value: string;
  readonly label: string;
}

/**
 * Options for a credential picker, with '' as the "None" choice.
 *
 * null when there is nothing to pick: either the viewer may not list credentials
 * (the API 403s and the caller collapses that to null) or none exist yet. Callers
 * hide the picker entirely in that case rather than showing an empty dropdown.
 */
export function toCredentialOptions(
  credentials: readonly RegistryCredential[] | null,
): readonly CredentialOption[] | null {
  if (!credentials || credentials.length === 0) return null;

  return [
    { value: '', label: 'None' },
    ...credentials.map((credential) => ({
      value: credential.id,
      label: `${credential.name} (${credential.registry})`,
    })),
  ];
}
