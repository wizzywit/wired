export type LoginFormFields = { email: string; password: string };

export function parseLoginFormFields(formData: FormData): LoginFormFields {
  return {
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  };
}
