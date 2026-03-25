import { type FormEvent, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { safeNextPath, getErrorMessage } from '../utils';
import { useLoginMutation } from './useLoginMutation';
import { parseLoginFormFields } from './loginLogic';

export function useLoginScreenUseCase() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const { email, password } = parseLoginFormFields(new FormData(e.currentTarget));

      try {
        await loginMutation.mutateAsync({ email, password });
        navigate(safeNextPath(searchParams.get('next')));
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to sign in right now.'));
      }
    },
    [loginMutation, navigate, searchParams]
  );

  return {
    error,
    isPending: loginMutation.isPending,
    handleSubmit,
  };
}
