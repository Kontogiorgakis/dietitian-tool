// Sample practice data: eight clients, Μαρία Παπαδοπούλου with eight visits.
// Run with: pnpm db:seed
import { PrismaPg } from "@prisma/adapter-pg";
import { type GoalDirection, PrismaClient, type Sex } from "@prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: (process.env.DATABASE_URL ?? process.env.DIRECT_URL)! }) });

const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setHours(11, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
};

interface SeedClient {
  firstName: string;
  lastName: string;
  sex: Sex;
  birthDate: string;
  heightCm: number;
  phone: string;
  goalText?: string;
  targetWeightKg?: number;
  goalDirection: GoalDirection;
  allergies?: string;
  intolerances?: string;
  medication?: string;
  conditions?: string;
  historyCompleted: boolean;
  /** [daysAgo, weight, fat %, lean kg, waist cm, note?] */
  visits: Array<[number, number, number | null, number | null, number | null, string?]>;
}

const CLIENTS: SeedClient[] = [
  {
    firstName: "Μαρία", lastName: "Παπαδοπούλου", sex: "FEMALE", birthDate: "1992-03-14", heightCm: 165, phone: "6941234567",
    goalText: "−8 κιλά μέχρι τον γάμο τον Ιούνιο", targetWeightKg: 70, goalDirection: "LOSE",
    allergies: "Ξηροί καρποί", intolerances: "Λακτόζη", medication: "Λεβοθυροξίνη 50 mcg", conditions: "Υποθυρεοειδισμός", historyCompleted: true,
    visits: [
      [161, 78.0, 31.2, 53.7, 92.0],
      [140, 77.1, 30.5, 53.5, 91.0, "Αυξήθηκε η πρωτεΐνη στο πρωινό."],
      [119, 76.4, 29.8, 53.6, 90.2],
      [98, 75.2, 28.9, 53.5, 88.6, "Ξεκίνησε περπάτημα 30 λεπτά τρεις φορές την εβδομάδα."],
      [77, 74.8, 28.3, 53.6, 87.5],
      [56, 74.1, 27.4, 53.8, 86.4, "Διακοπές, δύο γεύματα έξω την ημέρα. Επιστροφή στο πλάνο."],
      [28, 73.0, 26.8, 53.4, 85.0],
      [8, 72.4, 26.1, 53.5, 84.0, "Κόλλησε το βάρος δύο εβδομάδες, αλλά το λίπος συνεχίζει να πέφτει."],
    ],
  },
  {
    firstName: "Γιώργος", lastName: "Αντωνίου", sex: "MALE", birthDate: "1998-07-02", heightCm: 178, phone: "6972345678",
    goalText: "Να πάρω μυϊκή μάζα για την προετοιμασία", targetWeightKg: 72, goalDirection: "GAIN", historyCompleted: true,
    visits: [[90, 67.1, 14.2, 57.6, 78.0], [62, 67.8, 14.0, 58.3, 78.2], [41, 68.2, 13.8, 58.8, 78.5], [20, 68.6, 13.9, 59.1, 78.8], [9, 68.9, 13.7, 59.5, 79.0]],
  },
  {
    firstName: "Ελένη", lastName: "Κωνσταντίνου", sex: "FEMALE", birthDate: "1979-11-23", heightCm: 160, phone: "6983456789",
    goalText: "Να νιώθω πιο ελαφριά", targetWeightKg: 74, goalDirection: "LOSE", conditions: "Προδιαβήτης", historyCompleted: true,
    visits: [[45, 80.4, 38.1, 49.8, 96.0], [24, 80.9, 38.0, 50.1, 96.2], [10, 81.3, 38.3, 50.2, 96.5, "Νυχτερινή εργασία, δύσκολη εβδομάδα."]],
  },
  {
    firstName: "Νίκος", lastName: "Δημητρίου", sex: "MALE", birthDate: "1985-05-30", heightCm: 182, phone: "6994567890",
    goalDirection: "LOSE", historyCompleted: false,
    visits: [[11, 94.0, null, null, 102.0]],
  },
  {
    firstName: "Σοφία", lastName: "Ιωάννου", sex: "FEMALE", birthDate: "2001-01-09", heightCm: 168, phone: "6945678901",
    goalText: "Να τρώω καλύτερα στη σχολή", targetWeightKg: 60, goalDirection: "LOSE", intolerances: "Γλουτένη", historyCompleted: true,
    visits: [[75, 65.4, 29.0, 46.4, 80.0], [54, 64.6, 28.4, 46.3, 79.1], [33, 63.8, 27.9, 46.0, 78.4], [15, 63.1, 27.2, 46.0, 77.8]],
  },
  {
    firstName: "Κατερίνα", lastName: "Μιχαήλ", sex: "FEMALE", birthDate: "1970-09-17", heightCm: 158, phone: "6956789012",
    goalText: "Διατήρηση μετά την απώλεια", targetWeightKg: 70, goalDirection: "MAINTAIN", medication: "Μετφορμίνη 500 mg", conditions: "Διαβήτης τύπου 2", historyCompleted: true,
    visits: [[120, 71.2, 33.0, 47.7, 88.0], [96, 70.9, 32.8, 47.6, 87.6], [72, 70.6, 32.6, 47.6, 87.2], [48, 70.7, 32.7, 47.6, 87.0], [30, 70.5, 32.5, 47.6, 86.9], [18, 70.8, 32.6, 47.7, 87.1]],
  },
  {
    firstName: "Δημήτρης", lastName: "Παππάς", sex: "MALE", birthDate: "1990-12-05", heightCm: 175, phone: "6967890123",
    goalText: "Να χάσω την κοιλιά", targetWeightKg: 80, goalDirection: "LOSE", historyCompleted: true,
    visits: [[35, 87.9, 24.1, 66.7, 98.0], [22, 88.2, 24.3, 66.8, 98.4, "Ταξίδι για δουλειά, ακανόνιστα γεύματα."]],
  },
  {
    firstName: "Άννα", lastName: "Λαμπροπούλου", sex: "FEMALE", birthDate: "1995-04-21", heightCm: 171, phone: "6978901234",
    goalText: "Να ξαναμπώ στα ρούχα μου", targetWeightKg: 64, goalDirection: "LOSE", allergies: "Θαλασσινά", historyCompleted: true,
    visits: [[130, 69.6, 30.1, 48.6, 84.0], [109, 68.9, 29.6, 48.5, 83.2], [88, 68.3, 29.1, 48.4, 82.5], [67, 67.7, 28.6, 48.3, 81.9], [46, 67.2, 28.2, 48.3, 81.2], [32, 66.8, 27.9, 48.2, 80.8], [24, 66.5, 27.6, 48.1, 80.4]],
  },
];

const main = async () => {
  await prisma.measurement.deleteMany();
  await prisma.client.deleteMany();

  for (const c of CLIENTS) {
    const { visits, birthDate, ...rest } = c;
    await prisma.client.create({
      data: {
        ...rest,
        birthDate: new Date(birthDate),
        measurements: {
          create: visits.map(([ago, weightKg, bodyFatPct, leanMassKg, waistCm, note]) => ({
            visitedAt: daysAgo(ago),
            draft: false,
            weightKg,
            bodyFatPct,
            leanMassKg,
            waistCm,
            note: note ?? null,
          })),
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
