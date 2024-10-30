const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
  .option("clear", {
    type: "boolean",
    description: "Clear existing data before seeding",
    default: false,
  })
  .option("records", {
    type: "number",
    description: "Number of time punch records per associate",
    default: 5,
  })
  .option("users", {
    type: "number",
    description: "Number of associate users to create",
    default: 10,
  })
  .option("supervisors", {
    type: "number",
    description: "Number of supervisors to create",
    default: 3,
  }).argv;

const prisma = new PrismaClient();

async function main() {
  if (argv.clear) {
    // Clear existing data
    await prisma.auditLog.deleteMany();
    await prisma.uploadedDocument.deleteMany();
    await prisma.timePunch.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    console.log("Cleared existing data");
  }

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { sso: "ADMIN001" },
    update: {
      password: adminPassword,
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
    },
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      sso: "ADMIN001",
      role: "ADMIN",
    },
  });

  console.log("Created/Updated admin user");

  // Create payroll staff
  const payrollStaff = await prisma.user.upsert({
    where: { sso: "PAY001" },
    update: {
      password: await bcrypt.hash("payroll123", 10),
      name: "Payroll Staff",
      email: "payroll@example.com",
      role: "PAYROLL_STAFF",
    },
    create: {
      email: "payroll@example.com",
      password: await bcrypt.hash("payroll123", 10),
      name: "Payroll Staff",
      sso: "PAY001",
      role: "PAYROLL_STAFF",
    },
  });

  // Create supervisors
  const supervisors = await Promise.all(
    Array(argv.supervisors)
      .fill(null)
      .map(async (_, index) => {
        const sso = `SUP${String(index + 1).padStart(3, "0")}`;
        return prisma.user.upsert({
          where: { sso },
          update: {
            password: await bcrypt.hash("password123", 10),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            role: "SUPERVISOR",
          },
          create: {
            email: faker.internet.email(),
            password: await bcrypt.hash("password123", 10),
            name: faker.person.fullName(),
            sso,
            role: "SUPERVISOR",
          },
        });
      })
  );

  console.log("Created/Updated supervisors");

  // Create associates
  const associates = await Promise.all(
    Array(argv.users)
      .fill(null)
      .map(async (_, index) => {
        const sso = `ASC${String(index + 1).padStart(3, "0")}`;
        return prisma.user.upsert({
          where: { sso },
          update: {
            password: await bcrypt.hash("password123", 10),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            role: "ASSOCIATE",
          },
          create: {
            email: faker.internet.email(),
            password: await bcrypt.hash("password123", 10),
            name: faker.person.fullName(),
            sso,
            role: "ASSOCIATE",
          },
        });
      })
  );

  console.log("Created/Updated associates");

  // Create time punches
  const reasons = [
    "FORGOT_TIME_CARD",
    "LOST_TIME_CARD",
    "FORGOT_TO_PUNCH",
    "IN_THE_FIELD",
    "OTHER",
  ];

  // Delete existing time punches for these associates if we're not in clear mode
  // This ensures we don't keep adding records when running multiple times
  if (!argv.clear) {
    const associateIds = associates.map((a) => a.id);
    await prisma.auditLog.deleteMany({
      where: {
        timePunch: {
          employeeId: { in: associateIds },
        },
      },
    });
    await prisma.uploadedDocument.deleteMany({
      where: {
        timePunch: {
          employeeId: { in: associateIds },
        },
      },
    });
    await prisma.timePunch.deleteMany({
      where: {
        employeeId: { in: associateIds },
      },
    });
  }

  // Track supervisor assignments for reporting
  const supervisorAssignments = {};
  supervisors.forEach((s) => {
    supervisorAssignments[s.sso] = 0;
  });

  const timePunches = await Promise.all(
    associates.flatMap((associate) =>
      Array(argv.records)
        .fill(null)
        .map(async () => {
          const date = faker.date.recent({ days: 30 });
          // Randomly assign supervisor for each time punch
          const supervisor = faker.helpers.arrayElement(supervisors);
          supervisorAssignments[supervisor.sso]++;

          const isSigned = faker.datatype.boolean();

          const timePunch = await prisma.timePunch.create({
            data: {
              employeeId: associate.id,
              supervisorId: supervisor.id,
              date,
              timeIn: faker.datatype.boolean()
                ? null
                : faker.date.recent({ days: 1 }),
              timeOut: faker.datatype.boolean()
                ? null
                : faker.date.recent({ days: 1 }),
              mealIn: faker.datatype.boolean()
                ? null
                : faker.date.recent({ days: 1 }),
              mealOut: faker.datatype.boolean()
                ? null
                : faker.date.recent({ days: 1 }),
              missPunchReason: faker.helpers.arrayElement(reasons),
              otherReason: faker.helpers.maybe(() => faker.lorem.sentence()),
              location: faker.location.buildingNumber(),
              amount: faker.finance.amount(),
              isDigitallySigned: isSigned,
              signature: isSigned
                ? "data:image/png;base64,fake-signature-data"
                : null,
              signatureDate: isSigned ? date : null,
            },
          });

          // Create audit logs
          await prisma.auditLog.create({
            data: {
              timePunchId: timePunch.id,
              action: "CREATE",
              changes: {
                created: true,
                employeeId: associate.id,
                supervisorId: supervisor.id,
              },
              performedBy: payrollStaff.id,
            },
          });

          if (isSigned) {
            await prisma.auditLog.create({
              data: {
                timePunchId: timePunch.id,
                action: "SIGNATURE",
                changes: {
                  signed: true,
                  signatureDate: date,
                },
                performedBy: supervisor.id,
              },
            });
          }

          // Randomly create uploaded documents
          if (faker.datatype.boolean()) {
            await prisma.uploadedDocument.create({
              data: {
                timePunchId: timePunch.id,
                fileUrl: faker.image.dataUri(),
                uploadedAt: faker.date.recent({ days: 30 }),
              },
            });
          }

          return timePunch;
        })
    )
  );

  console.log("Created time punches with audit logs and documents");

  console.log({
    admin: 1,
    payrollStaff: 1,
    supervisors: supervisors.length,
    associates: associates.length,
    timePunches: timePunches.length,
    supervisorAssignments,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
