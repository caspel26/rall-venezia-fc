import type { Component } from 'vue'
import NextMatchWidget from '~/components/widgets/NextMatchWidget.vue'
import AvailabilityWidget from '~/components/widgets/AvailabilityWidget.vue'
import LastResultWidget from '~/components/widgets/LastResultWidget.vue'
import RecentMatchesWidget from '~/components/widgets/RecentMatchesWidget.vue'
import RecordWidget from '~/components/widgets/RecordWidget.vue'
import TopPerformersWidget from '~/components/widgets/TopPerformersWidget.vue'
import TopScorersWidget from '~/components/widgets/TopScorersWidget.vue'
import NewsWidget from '~/components/widgets/NewsWidget.vue'
import PollWidget from '~/components/widgets/PollWidget.vue'
import StandingsWidget from '~/components/widgets/StandingsWidget.vue'
import StaffWidget from '~/components/widgets/StaffWidget.vue'
import AnnouncementWidget from '~/components/widgets/AnnouncementWidget.vue'
import { ALL_ROLES, TEAM_ROLES, type Role } from '~/types/domain'

export interface WidgetDef {
  id: string
  component: Component
  /** Which home column the widget sits in (single column on phones, in this order). */
  slot: 'main' | 'side'
  /** Roles that see it; the data is protected by RLS regardless. */
  roles: readonly Role[]
}

/**
 * The home dashboard. To add a widget: create `components/widgets/XWidget.vue` (fetch its own data,
 * render nothing or an EmptyState when there is none) and add one line here.
 */
export const HOME_WIDGETS: WidgetDef[] = [
  { id: 'next-match', component: NextMatchWidget, slot: 'main', roles: ALL_ROLES },
  { id: 'availability', component: AvailabilityWidget, slot: 'main', roles: TEAM_ROLES },
  { id: 'poll', component: PollWidget, slot: 'main', roles: TEAM_ROLES },
  { id: 'last-result', component: LastResultWidget, slot: 'main', roles: ALL_ROLES },
  { id: 'recent-matches', component: RecentMatchesWidget, slot: 'main', roles: ALL_ROLES },
  { id: 'news', component: NewsWidget, slot: 'main', roles: ALL_ROLES },
  { id: 'standings', component: StandingsWidget, slot: 'side', roles: ALL_ROLES },
  { id: 'record', component: RecordWidget, slot: 'side', roles: ALL_ROLES },
  { id: 'top-performers', component: TopPerformersWidget, slot: 'side', roles: ALL_ROLES },
  { id: 'top-scorers', component: TopScorersWidget, slot: 'side', roles: ALL_ROLES },
  { id: 'staff', component: StaffWidget, slot: 'side', roles: ALL_ROLES },
  { id: 'announcement', component: AnnouncementWidget, slot: 'side', roles: TEAM_ROLES },
]
