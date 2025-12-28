/**
 * Routine Builder Page
 * 
 * Users can add products and build an optimized routine.
 */

import { useState } from 'react';
import { ClipboardList, Plus, Trash2, Sun, Moon, AlertTriangle, CheckCircle } from 'lucide-react';
import { useIngredients, useRoutineBuilder } from '../hooks/useApi';
import type { ProductRequest, RoutineTime } from '../types';

interface Product extends ProductRequest {
  id: string;
}

export default function RoutineBuilder() {
  const [time, setTime] = useState<RoutineTime>('pm');
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductIngredients, setNewProductIngredients] = useState<string[]>([]);

  const { data: ingredients } = useIngredients();
  const { mutate: buildRoutine, data: result, isPending } = useRoutineBuilder();

  // Add a product
  const addProduct = () => {
    if (newProductName && newProductIngredients.length > 0) {
      setProducts([
        ...products,
        {
          id: Date.now().toString(),
          name: newProductName,
          ingredients: newProductIngredients,
        },
      ]);
      setNewProductName('');
      setNewProductIngredients([]);
    }
  };

  // Remove a product
  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Build the routine
  const handleBuild = () => {
    buildRoutine({
      products: products.map(p => ({ name: p.name, ingredients: p.ingredients })),
      time,
    });
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary-500" />
          Routine Builder
        </h1>
        <p className="text-gray-500 mt-1">
          Build your skincare routine with automatic compatibility checking
        </p>
      </div>

      {/* Time Selection */}
      <div className="card p-6 mb-6">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setTime('am')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              time === 'am'
                ? 'bg-amber-50 text-amber-700 border-2 border-amber-200'
                : 'bg-gray-50 text-gray-600 border-2 border-transparent'
            }`}
          >
            <Sun className="w-5 h-5" />
            Morning (AM)
          </button>
          <button
            onClick={() => setTime('pm')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              time === 'pm'
                ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                : 'bg-gray-50 text-gray-600 border-2 border-transparent'
            }`}
          >
            <Moon className="w-5 h-5" />
            Evening (PM)
          </button>
        </div>
      </div>

      {/* Add Product Form */}
      <div className="card p-6 mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Add Product</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Product Name</label>
            <input
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="e.g., CeraVe PM"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Key Ingredients</label>
            <select
              multiple
              value={newProductIngredients}
              onChange={(e) => setNewProductIngredients(
                Array.from(e.target.selectedOptions, opt => opt.value)
              )}
              className="input h-24"
            >
              {ingredients?.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Ctrl/Cmd + click to select multiple</p>
          </div>
          <div className="flex items-end">
            <button
              onClick={addProduct}
              disabled={!newProductName || newProductIngredients.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Products List */}
      {products.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Your Products ({products.length})</h3>
          <div className="space-y-3">
            {products.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.ingredients.join(', ')})
                  </span>
                </div>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleBuild}
              disabled={products.length < 1 || isPending}
              className="btn-primary flex items-center gap-2"
            >
              {isPending ? 'Building...' : '🔍 Analyze Routine'}
            </button>
            <button
              onClick={() => setProducts([])}
              className="btn-secondary"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <div className="alert-info">
          <p className="text-sm">👆 Add products to your routine to get started</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Status */}
          <div className={`card p-6 ${result.is_valid ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-3">
              {result.is_valid ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <h3 className={`font-semibold ${result.is_valid ? 'text-green-700' : 'text-red-700'}`}>
                  {result.is_valid ? 'Your routine looks good!' : 'Issues found'}
                </h3>
                <p className={`text-sm ${result.is_valid ? 'text-green-600' : 'text-red-600'}`}>
                  {result.is_valid 
                    ? 'No conflicts detected.' 
                    : 'See details below.'}
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Order */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recommended Order</h3>
            <div className="space-y-3">
              {result.steps.map(step => (
                <div key={step.order} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                    {step.order}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium">{step.product_name}</span>
                    {step.wait_after > 0 && (
                      <span className="text-amber-600 text-sm ml-2">
                        ⏱️ wait {step.wait_after} min
                      </span>
                    )}
                    {step.notes && (
                      <p className="text-sm text-gray-500">{step.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">💡 Suggestions</h3>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-gray-600">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Essentials */}
          {result.missing_essentials.length > 0 && (
            <div className="alert-warning">
              <h4 className="font-medium mb-2">Missing Essentials</h4>
              <ul>
                {result.missing_essentials.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
