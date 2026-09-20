import "server-only";

import { prisma } from "@/lib/db";
import { isTowardGoal } from "@/lib/metro/calc";
import { fullName } from "@/lib/metro/format";
import type { ClientSummary, ClientWithMeasurements } from "@/types/metro";

/** Every client, most recently seen first, filtered on name or phone. */
export const listClients = async (search = ""): Promise<ClientSummary[]> => {
  const q = search.trim();
  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q.replace(/\s+/g, "") } },
          ],
        }
      : undefined,
    include: {
      measurements: {
        where: { draft: false },
        orderBy: { visitedAt: "asc" },
        select: { visitedAt: true, weightKg: true },
      },
    },
  });

  const summaries = clients.map((client): ClientSummary => {
    const withWeight = client.measurements.filter((m) => m.weightKg !== null);
    const first = withWeight[0]?.weightKg ?? null;
    const current = withWeight[withWeight.length - 1]?.weightKg ?? null;
    const change = withWeight.length >= 2 && first !== null && current !== null ? current - first : null;
    return {
      id: client.id,
      name: fullName(client),
      phone: client.phone,
      goalDirection: client.goalDirection,
      lastVisit: client.measurements[client.measurements.length - 1]?.visitedAt ?? null,
      visitCount: client.measurements.length,
      currentWeightKg: current,
      changeKg: change,
      towardGoal: change !== null && isTowardGoal(change, client.goalDirection),
    };
  });

  // Sorted by last visit, never alphabetically. Clients never seen sit at the end.
  return summaries.sort((a, b) => (b.lastVisit?.getTime() ?? 0) - (a.lastVisit?.getTime() ?? 0));
};

export const getClient = async (id: string): Promise<ClientWithMeasurements | null> =>
  prisma.client.findUnique({
    where: { id },
    include: { measurements: { where: { draft: false }, orderBy: { visitedAt: "asc" } } },
  });

/** The autosaved visit in progress, if the form was left half way. */
export const getDraft = async (clientId: string) =>
  prisma.measurement.findFirst({ where: { clientId, draft: true }, orderBy: { updatedAt: "desc" } });

/** One row of Επισκέψεις: a saved measurement with its client and the change since the previous visit. */
export interface VisitRow {
  id: string;
  clientId: string;
  clientName: string;
  goalDirection: ClientSummary["goalDirection"];
  visitedAt: Date;
  weightKg: number | null;
  bodyFatPct: number | null;
  waistCm: number | null;
  /** Weight change versus this client's previous visit, null on the first. */
  changeKg: number | null;
  towardGoal: boolean;
  note: string | null;
}

/** Every saved visit in the practice, newest first, filtered on the client's name. */
export const listVisits = async (search = ""): Promise<VisitRow[]> => {
  const q = search.trim();
  const rows = await prisma.measurement.findMany({
    where: {
      draft: false,
      ...(q ? { client: { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }] } } : {}),
    },
    orderBy: { visitedAt: "asc" },
    include: { client: { select: { id: true, firstName: true, lastName: true, goalDirection: true } } },
  });

  const previousWeight = new Map<string, number>();
  const visits = rows.map((m): VisitRow => {
    const prev = previousWeight.get(m.clientId);
    const change = m.weightKg !== null && prev !== undefined ? m.weightKg - prev : null;
    if (m.weightKg !== null) previousWeight.set(m.clientId, m.weightKg);
    return {
      id: m.id,
      clientId: m.clientId,
      clientName: fullName(m.client),
      goalDirection: m.client.goalDirection,
      visitedAt: m.visitedAt,
      weightKg: m.weightKg,
      bodyFatPct: m.bodyFatPct,
      waistCm: m.waistCm,
      changeKg: change,
      towardGoal: change !== null && isTowardGoal(change, m.client.goalDirection),
      note: m.note,
    };
  });
  return visits.reverse();
};

export interface AppointmentRow {
  id: string;
  clientId: string;
  clientName: string;
  startsAt: Date;
  durationMin: number;
  note: string | null;
}

/** Appointments from `from` (inclusive) to `to` (exclusive), earliest first. */
export const listAppointments = async (from: Date, to: Date): Promise<AppointmentRow[]> => {
  const rows = await prisma.appointment.findMany({
    where: { startsAt: { gte: from, lt: to } },
    orderBy: { startsAt: "asc" },
    include: { client: { select: { firstName: true, lastName: true } } },
  });
  return rows.map((a) => ({ id: a.id, clientId: a.clientId, clientName: fullName(a.client), startsAt: a.startsAt, durationMin: a.durationMin, note: a.note }));
};

export const getAppointment = async (id: string) => prisma.appointment.findUnique({ where: { id } });

/** Names for a client picker, alphabetical. */
export const listClientNames = async (): Promise<Array<{ id: string; name: string }>> => {
  const rows = await prisma.client.findMany({ select: { id: true, firstName: true, lastName: true }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }] });
  return rows.map((c) => ({ id: c.id, name: fullName(c) }));
};

/** The client's next booked appointment, if any. */
export const getNextAppointment = async (clientId: string) =>
  prisma.appointment.findFirst({ where: { clientId, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } });
