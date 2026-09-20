import "server-only";

import { prisma } from "@/lib/db";
import { isTowardGoal } from "@/lib/metro/calc";
import { addDays, startOfWeek } from "@/lib/metro/dates";
import { fullName } from "@/lib/metro/format";
import { type AppointmentRow, listAppointments, listVisits, type VisitRow } from "@/lib/metro/queries";

const DAY_MS = 86_400_000;
/** A client not seen for this long shows up under "Θέλουν προσοχή". */
export const ATTENTION_AFTER_DAYS = 30;

export interface AttentionClient {
  id: string;
  name: string;
  /** Days since the last visit, or null when never measured. */
  daysSince: number | null;
  hasAppointment: boolean;
}

export interface DashboardData {
  today: Date;
  todayAppointments: AppointmentRow[];
  nextAppointment: AppointmentRow | null;
  week: {
    visits: number;
    towardGoal: number;
    newClients: number;
    appointmentsLeft: number;
  };
  attention: AttentionClient[];
  recentVisits: VisitRow[];
  clientCount: number;
}

/** Everything the home screen shows, in one round of queries. */
export const getDashboard = async (): Promise<DashboardData> => {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);

  const [todayAppointments, weekAppointments, upcoming, visits, clients] = await Promise.all([
    listAppointments(dayStart, addDays(dayStart, 1)),
    listAppointments(weekStart, weekEnd),
    listAppointments(now, addDays(now, 60)),
    listVisits(),
    prisma.client.findMany({
      select: { id: true, firstName: true, lastName: true, createdAt: true, measurements: { where: { draft: false }, orderBy: { visitedAt: "desc" }, take: 1, select: { visitedAt: true } } },
    }),
  ]);

  const weekVisits = visits.filter((v) => v.visitedAt >= weekStart && v.visitedAt < weekEnd);
  const upcomingClientIds = new Set(upcoming.map((a) => a.clientId));

  const attention = clients
    .map((c): AttentionClient => {
      const last = c.measurements[0]?.visitedAt ?? null;
      return {
        id: c.id,
        name: fullName(c),
        daysSince: last ? Math.floor((now.getTime() - last.getTime()) / DAY_MS) : null,
        hasAppointment: upcomingClientIds.has(c.id),
      };
    })
    .filter((c) => !c.hasAppointment && (c.daysSince === null || c.daysSince >= ATTENTION_AFTER_DAYS))
    .sort((a, b) => (b.daysSince ?? Infinity) - (a.daysSince ?? Infinity))
    .slice(0, 6);

  return {
    today: now,
    todayAppointments,
    nextAppointment: upcoming[0] ?? null,
    week: {
      visits: weekVisits.length,
      towardGoal: weekVisits.filter((v) => v.changeKg !== null && isTowardGoal(v.changeKg, v.goalDirection)).length,
      newClients: clients.filter((c) => c.createdAt >= weekStart).length,
      appointmentsLeft: weekAppointments.filter((a) => a.startsAt >= now).length,
    },
    attention,
    recentVisits: visits.slice(0, 5),
    clientCount: clients.length,
  };
};
