'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * LESSONS PAGE
 * Capture learnings and retrospective notes from the project.
 */

type LessonCategory = 'WHAT_WORKED' | 'WHAT_DIDNT' | 'IMPROVEMENT' | 'RECOMMENDATION';
type LessonDepartment = 'PRODUCTION' | 'CAMERA' | 'LIGHTING' | 'SOUND' | 'POST' | 'GENERAL';

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  department: LessonDepartment;
  submittedBy: string;
  submittedAt: string;
  votes: number;
  tags: string[];
  actionItems?: string[];
}

// Data will be fetched from API
const initialLessons: Lesson[] = [];

const CATEGORY_CONFIG: Record<LessonCategory, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  WHAT_WORKED: { label: 'What Worked', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Check' },
  WHAT_DIDNT: { label: 'What Didn\'t Work', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'X' },
  IMPROVEMENT: { label: 'Improvement', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'TrendingUp' },
  RECOMMENDATION: { label: 'Recommendation', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Lightbulb' },
};

const DEPARTMENT_CONFIG: Record<LessonDepartment, { label: string; icon: keyof typeof Icons }> = {
  PRODUCTION: { label: 'Production', icon: 'Film' },
  CAMERA: { label: 'Camera', icon: 'Video' },
  LIGHTING: { label: 'Lighting', icon: 'Sun' },
  SOUND: { label: 'Sound', icon: 'Mic' },
  POST: { label: 'Post', icon: 'Sliders' },
  GENERAL: { label: 'General', icon: 'Settings' },
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [categoryFilter, setCategoryFilter] = useState<LessonCategory | 'ALL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<LessonDepartment | 'ALL'>('ALL');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const filteredLessons = lessons.filter(l => {
    if (categoryFilter !== 'ALL' && l.category !== categoryFilter) return false;
    if (departmentFilter !== 'ALL' && l.department !== departmentFilter) return false;
    return true;
  });

  const upvoteLesson = (id: string) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, votes: l.votes + 1 } : l));
  };

  const stats = {
    whatWorked: lessons.filter(l => l.category === 'WHAT_WORKED').length,
    whatDidnt: lessons.filter(l => l.category === 'WHAT_DIDNT').length,
    improvements: lessons.filter(l => l.category === 'IMPROVEMENT' || l.category === 'RECOMMENDATION').length,
    totalActionItems: lessons.reduce((sum, l) => sum + (l.actionItems?.length || 0), 0),
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/delivery"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-delivery)', color: 'white' }}
              >
                <Icons.BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Lessons Learned</h1>
                <p className="text-sm text-[var(--text-secondary)]">Capture project learnings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.whatWorked}</p>
              <p className="text-xs text-[var(--text-tertiary)]">What Worked</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.whatDidnt}</p>
              <p className="text-xs text-[var(--text-tertiary)]">What Didn&apos;t</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.improvements}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Improvements</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.totalActionItems}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Action Items</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                categoryFilter === 'ALL'
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All
            </button>
            {(Object.keys(CATEGORY_CONFIG) as LessonCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {CATEGORY_CONFIG[cat].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            <button
              onClick={() => setDepartmentFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                departmentFilter === 'ALL'
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All Depts
            </button>
            {(Object.keys(DEPARTMENT_CONFIG) as LessonDepartment[]).map(dept => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  departmentFilter === dept
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {DEPARTMENT_CONFIG[dept].label}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          {filteredLessons.sort((a, b) => b.votes - a.votes).map(lesson => {
            const categoryConfig = CATEGORY_CONFIG[lesson.category];
            const departmentConfig = DEPARTMENT_CONFIG[lesson.department];
            const CategoryIcon = Icons[categoryConfig.icon];
            const DeptIcon = Icons[departmentConfig.icon];
            const isExpanded = expandedLesson === lesson.id;

            return (
              <Card key={lesson.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Upvote */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => upvoteLesson(lesson.id)}
                        className="w-10 h-10 rounded-lg bg-[var(--bg-2)] hover:bg-[var(--primary-muted)] flex items-center justify-center transition-colors"
                      >
                        <Icons.ChevronUp className="w-5 h-5 text-[var(--text-tertiary)]" />
                      </button>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{lesson.votes}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: categoryConfig.bgColor,
                            color: categoryConfig.color,
                          }}
                        >
                          <CategoryIcon className="w-3 h-3" />
                          {categoryConfig.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-2)] text-xs text-[var(--text-tertiary)]">
                          <DeptIcon className="w-3 h-3" />
                          {departmentConfig.label}
                        </span>
                      </div>

                      <h3 className="font-semibold text-[var(--text-primary)] mb-2">{lesson.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-3">{lesson.description}</p>

                      <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                        <span>{lesson.submittedBy}</span>
                        <span>{lesson.submittedAt}</span>
                        <div className="flex gap-1">
                          {lesson.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-[var(--bg-2)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {lesson.actionItems && lesson.actionItems.length > 0 && (
                        <button
                          onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                          className="flex items-center gap-1 mt-3 text-sm text-[var(--primary)] hover:underline"
                        >
                          <Icons.List className="w-4 h-4" />
                          {lesson.actionItems.length} Action Item{lesson.actionItems.length > 1 ? 's' : ''}
                          <Icons.ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    <Button variant="ghost" size="sm">
                      <Icons.MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Items Expansion */}
                {isExpanded && lesson.actionItems && (
                  <div className="px-4 pb-4 pt-0 ml-14">
                    <div className="p-3 bg-[var(--bg-1)] rounded-lg border border-[var(--border-subtle)]">
                      <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-2">ACTION ITEMS</p>
                      <ul className="space-y-2">
                        {lesson.actionItems.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Icons.CheckSquare className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-[var(--text-secondary)]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {filteredLessons.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.BookOpen className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No lessons found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Start documenting learnings from this project.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Lesson
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
