import { useCallback } from 'react'
import { createPassionInFirestore } from '../../../lib/passionRepository'
import type { PassionInput } from '../../../types/models'

export function useAddPassion(userId?: string) {
  const submitPassion = useCallback(
    async (input: PassionInput) => {
      if (!userId) {
        return
      }

      await createPassionInFirestore(input, userId)
    },
    [userId],
  )

  return { submitPassion }
}
