import { type FormEvent, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage, safeNextPath } from '../utils';
import { parseRegisterFormFields } from './registerLogic';
import { useRegisterMutation } from './useRegisterMutation';

export function useRegisterScreenUseCase() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const fields = parseRegisterFormFields(new FormData(e.currentTarget));

      try {
        await registerMutation.mutateAsync(fields);
        navigate(safeNextPath(searchParams.get('next')));
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to create account right now.'));
      }
    },
    [navigate, registerMutation, searchParams]
  );

  return {
    error,
    showPassword,
    togglePasswordVisibility,
    isPending: registerMutation.isPending,
    handleSubmit,
  };
}
