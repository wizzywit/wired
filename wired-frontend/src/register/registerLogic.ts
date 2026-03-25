export type RegisterFormFields = {
  email: string;
  password: string;
  displayName?: string;
};

export function parseRegisterFormFields(formData: FormData): RegisterFormFields {
  const displayName = String(formData.get('full_name') ?? '').trim();
  return {
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
    displayName: displayName || undefined,
  };
}
