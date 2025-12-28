/**
 * Ingredient Checker Page
 * 
 * This is the main page where users check if ingredients are compatible.
 */

import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Sparkles, X } from 'lucide-react';
import { useIngredients, useCompatibilityCheck } from '../hooks/useApi';
import type { Interaction } from '../types';

export default function IngredientChecker() {
  // State for selected ingredients
  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all ingredients
  const { data: ingredients, isLoading: loadingIngredients } = useIngredients();

  // Mutation for checking compatibility
  const { 
    mutate: checkCompatibility, 
    data: result, 
    isPending: checking,
    reset: resetResult 
  } = useCompatibilityCheck();

  // Filter ingredients based on search
  const filteredIngredients = ingredients?.filter(ing =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Add an ingredient to selection
  const addIngredient = (id: string) => {
    if (!selected.includes(id) && selected.length < 10) {
      const newSelected = [...selected, id];
      setSelected(newSelected);
      
      // Auto-check when 2+ ingredients selected
      if (newSelected.length >= 2) {
        checkCompatibility(newSelected);
      }
    }
    setSearchTerm('');
  };

  // Remove an ingredient from selection
  const removeIngredient = (id: string) => {
    const newSelected = selected.filter(s => s !== id);
    setSelected(newSelected);
    
    if (newSelected.length >= 2) {
      checkCompatibility(newSelected);
    } else {
      resetResult();
    }
  };

  // Clear all selections
  const clearAll = () => {
    setSelected([]);
    resetResult();
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Search className="w-6 h-6 text-primary-500" />
          Ingredient Compatibility Checker
        </h1>
        <p className="text-gray-500 mt-1">
          Check if your skincare ingredients can be safely used together
        </p>
      </div>

      {/* Search and Select */}
      <div className="card p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search and select ingredients
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search (e.g., retinol, niacinamide)..."
            className="input pl-10"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Search Results Dropdown */}
        {searchTerm && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredIngredients.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm">No ingredients found</div>
            ) : (
              filteredIngredients.map(ing => (
                <button
                  key={ing.id}
                  onClick={() => addIngredient(ing.id)}
                  disabled={selected.includes(ing.id)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between ${
                    selected.includes(ing.id) ? 'opacity-50' : ''
                  }`}
                >
                  <span className="font-medium">{ing.name}</span>
                  <span className="text-xs text-gray-400">{ing.category}</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Selected Ingredients */}
        {selected.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Selected ({selected.length})
              </span>
              <button onClick={clearAll} className="text-sm text-gray-500 hover:text-gray-700">
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.map(id => {
                const ing = ingredients?.find(i => i.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {ing?.name || id}
                    <button
                      onClick={() => removeIngredient(id)}
                      className="hover:bg-primary-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Prompt to add more */}
        {selected.length < 2 && (
          <div className="alert-info mt-4">
            <p className="text-sm">
              👆 Select at least 2 ingredients to check their compatibility
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {checking && (
        <div className="card p-6 text-center">
          <div className="animate-pulse text-gray-500">Checking compatibility...</div>
        </div>
      )}

      {result && !checking && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className={`card p-6 text-center ${
            result.is_compatible 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            {result.is_compatible ? (
              <>
                {result.synergies.length > 0 ? (
                  <>
                    <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-purple-700">Great combination!</h2>
                    <p className="text-purple-600 text-sm">
                      These ingredients are compatible and some work synergistically together.
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-green-700">All clear!</h2>
                    <p className="text-green-600 text-sm">
                      These ingredients can be safely used together.
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h2 className="text-lg font-semibold text-red-700">Conflicts detected</h2>
                <p className="text-red-600 text-sm">
                  Some ingredients should NOT be used together. See details below.
                </p>
              </>
            )}
          </div>

          {/* Detailed Results */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Conflicts */}
            {result.conflicts.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Conflicts ({result.conflicts.length})
                </h3>
                <div className="space-y-4">
                  {result.conflicts.map((conflict, i) => (
                    <InteractionCard key={i} interaction={conflict} type="conflict" />
                  ))}
                </div>
              </div>
            )}

            {/* Cautions */}
            {result.cautions.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-amber-700 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Use with Caution ({result.cautions.length})
                </h3>
                <div className="space-y-4">
                  {result.cautions.map((caution, i) => (
                    <InteractionCard key={i} interaction={caution} type="caution" />
                  ))}
                </div>
              </div>
            )}

            {/* Synergies */}
            {result.synergies.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-purple-700 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Great Combinations ({result.synergies.length})
                </h3>
                <div className="space-y-4">
                  {result.synergies.map((synergy, i) => (
                    <InteractionCard key={i} interaction={synergy} type="synergy" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading state for ingredients */}
      {loadingIngredients && (
        <div className="text-center text-gray-500">Loading ingredients...</div>
      )}
    </div>
  );
}

/**
 * Interaction Card Component
 * Shows details about an ingredient interaction.
 */
function InteractionCard({ 
  interaction, 
  type 
}: { 
  interaction: Interaction; 
  type: 'conflict' | 'caution' | 'synergy';
}) {
  const colors = {
    conflict: 'border-red-200 bg-red-50',
    caution: 'border-amber-200 bg-amber-50',
    synergy: 'border-purple-200 bg-purple-50',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[type]}`}>
      <div className="font-medium mb-1">
        {interaction.ingredient_a} + {interaction.ingredient_b}
      </div>
      <p className="text-sm text-gray-600 mb-2">{interaction.explanation}</p>
      <p className="text-sm font-medium">
        💡 {interaction.recommendation}
      </p>
    </div>
  );
}
