/**
 * React Query Hooks
 * 
 * WHAT IS REACT QUERY?
 * ====================
 * React Query handles "server state" - data that lives on your backend.
 * It provides:
 * - Automatic caching
 * - Background refetching
 * - Loading/error states
 * - Optimistic updates
 * 
 * WHY USE IT?
 * ===========
 * Without React Query, you'd write this in every component:
 *   const [data, setData] = useState(null);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState(null);
 *   useEffect(() => { fetch()... }, []);
 * 
 * React Query gives you this for free:
 *   const { data, isLoading, error } = useQuery(...)
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { ingredientsApi, routinesApi, advisorApi } from '../services/api';
import type {
  CompatibilityCheckResponse,
  RoutineBuildRequest,
  RoutineResponse,
  AdvisorQuestionRequest,
  AdvisorResponse,
} from '../types';

// =============================================================================
// INGREDIENTS HOOKS
// =============================================================================

/**
 * Hook to fetch all ingredients.
 * 
 * USAGE:
 *   const { data: ingredients, isLoading } = useIngredients();
 */
export function useIngredients(params?: {
  category?: string;
  concern?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['ingredients', params],  // Cache key - refetches if params change
    queryFn: () => ingredientsApi.list(params),
  });
}

/**
 * Hook to fetch a single ingredient.
 * 
 * USAGE:
 *   const { data: ingredient } = useIngredient('retinol');
 */
export function useIngredient(id: string) {
  return useQuery({
    queryKey: ['ingredient', id],
    queryFn: () => ingredientsApi.get(id),
    enabled: !!id,  // Don't fetch if id is empty
  });
}

/**
 * Hook to check ingredient compatibility.
 * 
 * This is a MUTATION because we're sending data, not just fetching.
 * 
 * USAGE:
 *   const { mutate: checkCompatibility, data } = useCompatibilityCheck();
 *   checkCompatibility(['retinol', 'vitamin_c']);
 */
export function useCompatibilityCheck() {
  return useMutation<CompatibilityCheckResponse, Error, string[]>({
    mutationFn: (ingredients) => ingredientsApi.checkCompatibility(ingredients),
  });
}

// =============================================================================
// ROUTINES HOOKS
// =============================================================================

/**
 * Hook to build a routine.
 * 
 * USAGE:
 *   const { mutate: buildRoutine, data } = useRoutineBuilder();
 *   buildRoutine({ products: [...], time: 'am' });
 */
export function useRoutineBuilder() {
  return useMutation<RoutineResponse, Error, RoutineBuildRequest>({
    mutationFn: (request) => routinesApi.build(request),
  });
}

// =============================================================================
// ADVISOR HOOKS
// =============================================================================

/**
 * Hook to ask the advisor a question.
 * 
 * USAGE:
 *   const { mutate: askQuestion, data } = useAdvisor();
 *   askQuestion({ question: 'Can I use retinol with vitamin C?' });
 */
export function useAdvisor() {
  return useMutation<AdvisorResponse, Error, AdvisorQuestionRequest>({
    mutationFn: (request) => advisorApi.ask(request),
  });
}

/**
 * Hook to get example questions.
 */
export function useExampleQuestions() {
  return useQuery({
    queryKey: ['example-questions'],
    queryFn: () => advisorApi.getExamples(),
  });
}
