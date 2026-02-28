/**
 * Analytics Service
 * Business logic for dashboard statistics and analytics
 */

import {
  getSubscriptionCountsByStatus,
  listSubscriptions,
} from '@/lib/repositories/subscription.repository';
import { getTodayRedemptionsCount } from '@/lib/repositories/redemption.repository';
import { supabaseServer } from '@/lib/supabase/server';
import {
  DashboardStats,
  RevenueTrend,
  SubscriptionTrend,
  SubscriptionStatus,
} from '@/types/entities';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<{
  success: boolean;
  stats?: DashboardStats;
  error?: string;
}> {
  try {
    // Get subscription counts by status
    const statusCounts = await getSubscriptionCountsByStatus();

    // Get today's redemptions
    const todayRedemptions = await getTodayRedemptionsCount();

    // Calculate revenue
    const { data: revenueData, error: revenueError } = await supabaseServer
      .from('subscriptions')
      .select('price, activated_at')
      .in('status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED]);

    if (revenueError) {
      throw new Error(`Failed to calculate revenue: ${revenueError.message}`);
    }

    const totalRevenue = revenueData.reduce((sum, sub) => sum + Number(sub.price), 0);

    // Weekly revenue (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyRevenue = revenueData
      .filter((sub) => sub.activated_at && new Date(sub.activated_at) >= sevenDaysAgo)
      .reduce((sum, sub) => sum + Number(sub.price), 0);

    // Monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyRevenue = revenueData
      .filter((sub) => sub.activated_at && new Date(sub.activated_at) >= thirtyDaysAgo)
      .reduce((sum, sub) => sum + Number(sub.price), 0);

    // Calculate revenue change (compare this week to previous week)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const previousWeekRevenue = revenueData
      .filter(
        (sub) =>
          sub.activated_at &&
          new Date(sub.activated_at) >= fourteenDaysAgo &&
          new Date(sub.activated_at) < sevenDaysAgo
      )
      .reduce((sum, sub) => sum + Number(sub.price), 0);

    const revenueChange =
      previousWeekRevenue > 0
        ? ((weeklyRevenue - previousWeekRevenue) / previousWeekRevenue) * 100
        : 0;

    const stats: DashboardStats = {
      activeSubscriptions: statusCounts.active,
      pendingActivations: statusCounts.pending_payment,
      todayRedemptions,
      totalRevenue,
      weeklyRevenue,
      monthlyRevenue,
      revenueChange: Math.round(revenueChange * 100) / 100,
      subscriptionsByStatus: statusCounts,
    };

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء جلب الإحصائيات',
    };
  }
}

/**
 * Get revenue trends for charts
 */
export async function getRevenueTrends(days: number = 7): Promise<{
  success: boolean;
  trends?: RevenueTrend[];
  error?: string;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseServer
      .from('subscriptions')
      .select('price, activated_at')
      .in('status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED])
      .gte('activated_at', startDate.toISOString())
      .order('activated_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get revenue trends: ${error.message}`);
    }

    // Group by date
    const trendMap = new Map<string, { revenue: number; count: number }>();

    data.forEach((sub) => {
      if (!sub.activated_at) return;

      const date = new Date(sub.activated_at);
      const dateKey = date.toISOString().split('T')[0];

      const existing = trendMap.get(dateKey) || { revenue: 0, count: 0 };
      trendMap.set(dateKey, {
        revenue: existing.revenue + Number(sub.price),
        count: existing.count + 1,
      });
    });

    // Convert to array and fill missing dates
    const trends: RevenueTrend[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];

      const trend = trendMap.get(dateKey) || { revenue: 0, count: 0 };
      trends.push({
        date: dateKey,
        revenue: trend.revenue,
        subscriptions: trend.count,
      });
    }

    return {
      success: true,
      trends,
    };
  } catch (error) {
    console.error('Get revenue trends error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء جلب اتجاهات الإيرادات',
    };
  }
}

/**
 * Get subscription trends by plan type
 */
export async function getSubscriptionTrends(days: number = 30): Promise<{
  success: boolean;
  trends?: SubscriptionTrend[];
  error?: string;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseServer
      .from('subscriptions')
      .select('plan_type, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get subscription trends: ${error.message}`);
    }

    // Group by date and plan type
    const trendMap = new Map<string, { weekly: number; monthly: number }>();

    data.forEach((sub) => {
      const date = new Date(sub.created_at);
      const dateKey = date.toISOString().split('T')[0];

      const existing = trendMap.get(dateKey) || { weekly: 0, monthly: 0 };
      if (sub.plan_type === 'weekly') {
        existing.weekly++;
      } else if (sub.plan_type === 'monthly') {
        existing.monthly++;
      }
      trendMap.set(dateKey, existing);
    });

    // Convert to array and fill missing dates
    const trends: SubscriptionTrend[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];

      const trend = trendMap.get(dateKey) || { weekly: 0, monthly: 0 };
      trends.push({
        date: dateKey,
        weekly: trend.weekly,
        monthly: trend.monthly,
        total: trend.weekly + trend.monthly,
      });
    }

    return {
      success: true,
      trends,
    };
  } catch (error) {
    console.error('Get subscription trends error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء جلب اتجاهات الاشتراكات',
    };
  }
}
