'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  AnalyticsTimeRange,
  FullAnalyticsData,
  DashboardAnalyticsKpi,
} from '@/lib/types/analytics';
import {
  computeAnalyticsData,
  computeDashboardKpi,
  generateDemoAnalyticsData,
} from '@/lib/analytics-calculations';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch full workout analytics for the current authenticated user.
 */
export async function getAnalyticsDataAction(
  range: AnalyticsTimeRange = '30d'
): Promise<ActionResult<FullAnalyticsData>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    // Query all completed workouts with exercises and sets for this user
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select(`
        id,
        name,
        started_at,
        ended_at,
        created_at,
        notes,
        workout_exercises (
          id,
          exercise_id,
          position,
          exercise:exercises (
            id,
            name,
            body_part,
            target,
            muscle_group,
            category
          ),
          sets (
            id,
            set_number,
            set_type,
            reps,
            weight_kg,
            duration_sec,
            rpe,
            is_completed,
            completed_at,
            est_1rm_kg
          )
        )
      `)
      .eq('user_id', user.id)
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: true });

    if (error) {
      console.error('[getAnalyticsDataAction] Supabase error:', error);
      return { success: false, error: error.message };
    }

    const analytics = computeAnalyticsData(workouts || [], range);
    return { success: true, data: analytics };
  } catch (err: unknown) {
    console.error('[getAnalyticsDataAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch analytics',
    };
  }
}

/**
 * Fetch lightweight KPI summary for the Dashboard widget glimpse.
 */
export async function getDashboardAnalyticsKpiAction(): Promise<
  ActionResult<DashboardAnalyticsKpi>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: workouts, error } = await supabase
      .from('workouts')
      .select(`
        id,
        name,
        started_at,
        ended_at,
        workout_exercises (
          id,
          exercise_id,
          exercise:exercises (
            id,
            name,
            body_part,
            target
          ),
          sets (
            id,
            set_type,
            reps,
            weight_kg,
            is_completed,
            est_1rm_kg
          )
        )
      `)
      .eq('user_id', user.id)
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: true });

    if (error) {
      console.error('[getDashboardAnalyticsKpiAction] Supabase error:', error);
      return { success: false, error: error.message };
    }

    const kpi = computeDashboardKpi(workouts || []);
    return { success: true, data: kpi };
  } catch (err: unknown) {
    console.error('[getDashboardAnalyticsKpiAction] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch dashboard KPI',
    };
  }
}
