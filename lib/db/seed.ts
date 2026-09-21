// Sample practice data: three clients with every history field and every measurement
// field filled at every visit, a past appointment for each visit, and upcoming ones
// across this week and the next.
// Run with: pnpm db:seed (deletes every client, measurement and appointment first)
import { PrismaPg } from "@prisma/adapter-pg";
import { type GoalDirection, PrismaClient, type Sex } from "@prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: (process.env.DATABASE_URL ?? process.env.DIRECT_URL)! }) });

const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setHours(11, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
};

const daysAhead = (n: number, hour: number, minute: number): Date => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};

/** One visit: days ago, weight, fat %, waist, hip, chest, arm, thigh, water %, biceps, triceps, subscapular, suprailiac, blood pressure, pulse, note. */
type SeedVisit = [number, number, number, number, number, number, number, number, number, number, number, number, number, string, number, string?];

interface SeedClient {
  firstName: string;
  lastName: string;
  sex: Sex;
  birthDate: string;
  heightCm: number;
  phone: string;
  email: string;
  goalText: string;
  targetWeightKg: number;
  goalDirection: GoalDirection;
  activityLevel: string;
  medicalHistory: string;
  medication: string;
  allergies: string;
  intolerances: string;
  conditions: string;
  dietPreferences: string;
  habits: string;
  visits: SeedVisit[];
  /** Upcoming: days ahead, hour, minute, duration, note. Past ones come from the visits. */
  upcoming: Array<[number, number, number, number, string?]>;
}

// The skinfold sums match the fat % through Durnin and Womersley, so the derived value agrees with the entered one.
const CLIENTS: SeedClient[] = [
  {
    firstName: "Μαρία", lastName: "Παπαδοπούλου", sex: "FEMALE", birthDate: "1992-03-14", heightCm: 165, phone: "6941234567", email: "maria.pap@example.com",
    goalText: "−8 κιλά μέχρι τον γάμο τον Ιούνιο", targetWeightKg: 70, goalDirection: "LOSE", activityLevel: "Ελαφριά",
    medicalHistory: "Υποθυρεοειδισμός από το 2019, ρυθμισμένος. Καμία επέμβαση.", medication: "Λεβοθυροξίνη 50 mcg", allergies: "Ξηροί καρποί", intolerances: "Λακτόζη",
    conditions: "Υποθυρεοειδισμός", dietPreferences: "Τρώει ψάρι δύο φορές την εβδομάδα, όχι κόκκινο κρέας", habits: "Καφές τρεις φορές την ημέρα, ύπνος έξι ώρες τις καθημερινές",
    visits: [
      [161, 78.0, 31.2, 92.0, 104.0, 96.0, 31.0, 60.0, 48.0, 10.0, 18.0, 16.0, 19.0, "128/84", 76],
      [140, 77.1, 30.5, 91.0, 103.4, 95.6, 30.8, 59.6, 48.4, 9.5, 17.0, 15.5, 18.0, "126/82", 75, "Αυξήθηκε η πρωτεΐνη στο πρωινό."],
      [119, 76.4, 29.8, 90.2, 102.8, 95.1, 30.6, 59.2, 48.9, 9.0, 16.0, 14.5, 17.0, "124/82", 74],
      [98, 75.2, 28.9, 88.6, 102.0, 94.5, 30.4, 58.6, 49.4, 8.5, 15.0, 13.5, 16.0, "122/80", 72, "Ξεκίνησε περπάτημα 30 λεπτά τρεις φορές την εβδομάδα."],
      [77, 74.8, 28.3, 87.5, 101.4, 94.0, 30.2, 58.2, 49.8, 8.0, 14.0, 13.0, 15.0, "122/78", 72],
      [56, 74.1, 27.4, 86.4, 100.8, 93.6, 30.0, 57.8, 50.2, 7.5, 13.5, 12.0, 14.0, "120/78", 70, "Διακοπές, δύο γεύματα έξω την ημέρα. Επιστροφή στο πλάνο."],
      [28, 73.0, 26.8, 85.0, 100.0, 93.0, 29.7, 57.3, 50.7, 7.0, 12.5, 11.5, 13.0, "118/76", 69],
      [8, 72.4, 26.1, 84.0, 99.5, 92.5, 29.5, 57.0, 51.0, 7.0, 12.0, 11.0, 12.0, "118/76", 68, "Κόλλησε το βάρος δύο εβδομάδες, αλλά το λίπος συνεχίζει να πέφτει."],
    ],
    upcoming: [[0, 17, 30, 45, "Έλεγχος πλάνου πριν τις διακοπές"], [14, 17, 30, 45], [28, 17, 30, 45]],
  },
  {
    firstName: "Γιώργος", lastName: "Αντωνίου", sex: "MALE", birthDate: "1998-07-02", heightCm: 178, phone: "6972345678", email: "g.antoniou@example.com",
    goalText: "Να πάρω μυϊκή μάζα για την προετοιμασία", targetWeightKg: 72, goalDirection: "GAIN", activityLevel: "Έντονη",
    medicalHistory: "Κάταγμα κερκίδας το 2021, πλήρης αποκατάσταση.", medication: "Καμία", allergies: "Καμία γνωστή", intolerances: "Καμία",
    conditions: "Καμία", dietPreferences: "Τρώει τα πάντα, προτιμά μαγειρεμένο στο σπίτι", habits: "Προπόνηση πέντε φορές την εβδομάδα, ύπνος οκτώ ώρες",
    visits: [
      [110, 66.5, 14.4, 77.5, 92.0, 94.0, 30.0, 53.0, 60.0, 5.0, 9.0, 10.0, 10.5, "118/72", 62],
      [90, 67.1, 14.2, 78.0, 92.5, 94.8, 30.5, 53.6, 60.2, 5.0, 9.0, 10.0, 10.0, "118/72", 61, "Πρωτεΐνη 1,8 g ανά κιλό, τρία κύρια γεύματα και δύο σνακ."],
      [62, 67.8, 14.0, 78.2, 93.0, 95.6, 31.0, 54.2, 60.4, 5.0, 8.5, 9.5, 10.0, "116/72", 60],
      [41, 68.2, 13.8, 78.5, 93.4, 96.3, 31.6, 54.7, 60.6, 4.5, 8.5, 9.5, 10.0, "116/70", 60],
      [20, 68.6, 13.9, 78.8, 93.8, 97.0, 32.1, 55.2, 60.8, 4.5, 8.5, 9.5, 10.0, "116/70", 59, "Ενόχληση στον ώμο, λιγότερη προπόνηση για δύο εβδομάδες."],
      [9, 68.9, 13.7, 79.0, 94.0, 97.5, 32.5, 55.5, 61.0, 4.5, 8.5, 9.5, 10.0, "116/70", 58],
    ],
    upcoming: [[2, 18, 30, 30, "Ζύγισμα και αναπροσαρμογή θερμίδων"], [9, 18, 30, 30], [23, 18, 30, 30]],
  },
  {
    firstName: "Ελένη", lastName: "Κωνσταντίνου", sex: "FEMALE", birthDate: "1979-11-23", heightCm: 160, phone: "6983456789", email: "eleni.k@example.com",
    goalText: "Να κρατήσω τα κιλά που έχασα", targetWeightKg: 74, goalDirection: "MAINTAIN", activityLevel: "Μέτρια",
    medicalHistory: "Απώλεια 9 κιλών πέρυσι. Προδιαβήτης από το 2024, χωρίς επιπλοκές.", medication: "Μετφορμίνη 500 mg", allergies: "Πενικιλίνη", intolerances: "Καμία",
    conditions: "Προδιαβήτης", dietPreferences: "Χορτοφαγική τρεις μέρες την εβδομάδα", habits: "Νυχτερινή εργασία κάθε δεύτερη εβδομάδα, περπάτημα με τον σκύλο καθημερινά",
    visits: [
      [120, 74.8, 35.0, 88.0, 103.0, 97.0, 30.5, 58.0, 47.0, 11.0, 20.0, 18.0, 20.5, "134/86", 74, "Πρώτη επίσκεψη μετά την απώλεια, στόχος η διατήρηση."],
      [90, 74.5, 34.8, 87.6, 102.8, 96.8, 30.4, 57.8, 47.2, 11.0, 20.0, 18.0, 20.0, "132/86", 74],
      [60, 74.6, 34.8, 87.5, 102.8, 96.8, 30.3, 57.8, 47.2, 10.5, 19.5, 17.5, 20.0, "130/84", 73, "Νυχτερινή εργασία, δύσκολη εβδομάδα."],
      [30, 74.3, 34.5, 87.2, 102.6, 96.6, 30.2, 57.6, 47.4, 10.5, 19.0, 17.5, 19.5, "130/82", 72],
      [7, 74.2, 34.4, 87.0, 102.5, 96.5, 30.0, 57.5, 47.5, 10.5, 19.0, 17.5, 19.0, "128/82", 72, "Γλυκόζη νηστείας 98, από 104."],
    ],
    upcoming: [[6, 11, 0, 45, "Αποτελέσματα εξετάσεων"], [20, 11, 0, 45]],
  },
];

const round1 = (n: number): number => Math.round(n * 10) / 10;

const main = async () => {
  await prisma.appointment.deleteMany();
  await prisma.measurement.deleteMany();
  await prisma.client.deleteMany();

  for (const c of CLIENTS) {
    const { visits, upcoming, birthDate, ...rest } = c;
    await prisma.client.create({
      data: {
        ...rest,
        birthDate: new Date(birthDate),
        historyCompleted: true,
        // Registered the day of the first visit, so the dashboard's "new this week" counts real arrivals only.
        createdAt: daysAgo(visits[0][0]),
        measurements: {
          create: visits.map(([ago, weightKg, bodyFatPct, waistCm, hipCm, chestCm, armCm, thighCm, waterPct, biceps, triceps, subscapular, suprailiac, bloodPressure, pulseBpm, visitNote]) => ({
            visitedAt: daysAgo(ago),
            draft: false,
            weightKg,
            waistCm,
            hipCm,
            chestCm,
            armCm,
            thighCm,
            bodyFatPct,
            leanMassKg: round1(weightKg * (1 - bodyFatPct / 100)),
            waterPct,
            skinfoldBicepsMm: biceps,
            skinfoldTricepsMm: triceps,
            skinfoldSubscapularMm: subscapular,
            skinfoldSuprailiacMm: suprailiac,
            bloodPressure,
            pulseBpm,
            note: visitNote ?? null,
          })),
        },
        appointments: {
          create: [
            ...visits.map(([ago]) => ({ startsAt: daysAgo(ago), durationMin: 45 })),
            ...upcoming.map(([ahead, hour, minute, durationMin, note]) => ({ startsAt: daysAhead(ahead, hour, minute), durationMin, note: note ?? null })),
          ],
        },
      },
    });
  }
  console.log(`Seeded ${CLIENTS.length} clients.`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
