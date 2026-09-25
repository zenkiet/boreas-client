import { RegistryCredential } from './registry-credential';

interface CredentialOption {
  readonly value: string;
  readonly label: string;
}

/** '' is the "None" choice; null (a 403 or no credentials yet) means hide the picker. */
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
