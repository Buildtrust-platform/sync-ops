'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * BUDGET MANAGEMENT PAGE
 * Create and track project budgets with line items,
 * categories, and budget vs actual comparison.
 */

type BudgetCategory = 'PRE_PRODUCTION' | 'PRODUCTION' | 'POST_PRODUCTION' | 'DISTRIBUTION' | 'CONTINGENCY';

interface BudgetLineItem {
  id: string;
  category: BudgetCategory;
  description: string;
  budgeted: number;
  actual: number;
  notes?: string;
}

interface BudgetSummary {
  totalBudget: number;
  totalActual: number;
  variance: number;
  variancePercent: number;
}

// Data will be fetched from API
const initialLineItems: BudgetLineItem[] = [];

const CATEGORY_CONFIG: Record<BudgetCategory, { label: string; color: string; icon: keyof typeof Icons }> = {
  PRE_PRODUCTION: { label: 'Pre-Production', color: 'var(--phase-preproduction)', icon: 'Clipboard' },
  PRODUCTION: { label: 'Production', color: 'var(--phase-production)', icon: 'Video' },
  POST_PRODUCTION: { label: 'Post-Production', color: 'var(--phase-postproduction)', icon: 'Film' },
  DISTRIBUTION: { label: 'Distribution', color: 'var(--phase-delivery)', icon: 'Share' },
  CONTINGENCY: { label: 'Contingency', color: 'var(--warning)', icon: 'AlertTriangle' },
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

export default function BudgetPage() {
  const [lineItems] = useState<BudgetLineItem[]>(initialLineItems);
  const [activeCategory, setActiveCategory] = useState<BudgetCategory | 'ALL'>('ALL');

  const filteredItems = lineItems.filter(
    item => activeCategory === 'ALL' || item.category === activeCategory
  );

  const calculateSummary = (items: BudgetLineItem[]): BudgetSummary => {
    const totalBudget = items.reduce((sum, item) => sum + item.budgeted, 0);
    const totalActual = items.reduce((sum, item) => sum + item.actual, 0);
    const variance = totalBudget - totalActual;
    const variancePercent = totalBudget > 0 ? (variance / totalBudget) * 100 : 0;
    return { totalBudget, totalActual, variance, variancePercent };
  };

  const summary = calculateSummary(lineItems);
  const categoryTotals = Object.keys(CATEGORY_CONFIG).map(cat => ({
    category: cat as BudgetCategory,
    ...calculateSummary(lineItems.filter(item => item.category === cat)),
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/development"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-development)', color: 'white' }}
              >
                <Icons.DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Budget Management</h1>
                <p className="text-sm text-[var(--text-secondary)]">Track expenses and manage project budget</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Line Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-5">
            <p className="text-sm text-[var(--text-tertiary)] mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(summary.totalBudget)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-[var(--text-tertiary)] mb-1">Actual Spend</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(summary.totalActual)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-[var(--text-tertiary)] mb-1">Variance</p>
            <p className={`text-2xl font-bold ${summary.variance >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {summary.variance >= 0 ? '+' : ''}{formatCurrency(summary.variance)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-[var(--text-tertiary)] mb-1">% of Budget Used</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {((summary.totalActual / summary.totalBudget) * 100).toFixed(1)}%
            </p>
            <div className="w-full h-2 bg-[var(--bg-3)] rounded-full mt-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((summary.totalActual / summary.totalBudget) * 100, 100)}%`,
                  backgroundColor: summary.totalActual > summary.totalBudget ? 'var(--danger)' : 'var(--success)',
                }}
              />
            </div>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="p-5 mb-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Budget by Category</h3>
          <div className="space-y-3">
            {categoryTotals.map(({ category, totalBudget, totalActual }) => {
              const config = CATEGORY_CONFIG[category];
              const percent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
              const CategoryIcon = Icons[config.icon];
              return (
                <div key={category} className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{config.label}</span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {formatCurrency(totalActual)} / {formatCurrency(totalBudget)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-3)] rounded-full">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(percent, 100)}%`,
                          backgroundColor: percent > 100 ? 'var(--danger)' : config.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeCategory === 'ALL'
                ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as BudgetCategory)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeCategory === key
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Line Items Table */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Description</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Category</th>
                <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Budgeted</th>
                <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actual</th>
                <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Variance</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredItems.map((item) => {
                const variance = item.budgeted - item.actual;
                const config = CATEGORY_CONFIG[item.category];
                return (
                  <tr key={item.id} className="hover:bg-[var(--bg-1)] transition-colors">
                    <td className="p-4">
                      <span className="font-medium text-[var(--text-primary)]">{item.description}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: `${config.color}20`, color: config.color }}
                      >
                        {config.label}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[var(--text-secondary)]">{formatCurrency(item.budgeted)}</td>
                    <td className="p-4 text-right text-[var(--text-primary)] font-medium">{formatCurrency(item.actual)}</td>
                    <td className={`p-4 text-right font-medium ${variance >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-tertiary)] max-w-xs truncate">
                      {item.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--border-default)] bg-[var(--bg-1)]">
                <td className="p-4 font-semibold text-[var(--text-primary)]" colSpan={2}>Total</td>
                <td className="p-4 text-right font-semibold text-[var(--text-primary)]">
                  {formatCurrency(filteredItems.reduce((sum, item) => sum + item.budgeted, 0))}
                </td>
                <td className="p-4 text-right font-semibold text-[var(--text-primary)]">
                  {formatCurrency(filteredItems.reduce((sum, item) => sum + item.actual, 0))}
                </td>
                <td className={`p-4 text-right font-semibold ${
                  filteredItems.reduce((sum, item) => sum + (item.budgeted - item.actual), 0) >= 0
                    ? 'text-[var(--success)]'
                    : 'text-[var(--danger)]'
                }`}>
                  {filteredItems.reduce((sum, item) => sum + (item.budgeted - item.actual), 0) >= 0 ? '+' : ''}
                  {formatCurrency(filteredItems.reduce((sum, item) => sum + (item.budgeted - item.actual), 0))}
                </td>
                <td className="p-4"></td>
              </tr>
            </tfoot>
          </table>
        </Card>
      </div>
    </div>
  );
}
