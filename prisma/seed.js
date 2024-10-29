const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.uploadedDocument.deleteMany();
  await prisma.timePunch.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      sso: "ADMIN001",
      role: "ADMIN",
    },
  });

  console.log("Created admin user");

  // Create payroll staff
  const payrollStaff = await prisma.user.create({
    data: {
      email: "payroll@example.com",
      password: await bcrypt.hash("payroll123", 10),
      name: "Payroll Staff",
      sso: "PAY001",
      role: "PAYROLL_STAFF",
    },
  });

  // Create supervisors
  const supervisors = await Promise.all(
    Array(3)
      .fill(null)
      .map(async (_, index) => {
        return prisma.user.create({
          data: {
            email: faker.internet.email(),
            password: await bcrypt.hash("password123", 10),
            name: faker.person.fullName(),
            sso: `SUP${String(index + 1).padStart(3, "0")}`,
            role: "SUPERVISOR",
          },
        });
      })
  );

  console.log("Created supervisors");

  // Create associates
  const associates = await Promise.all(
    Array(10)
      .fill(null)
      .map(async (_, index) => {
        return prisma.user.create({
          data: {
            email: faker.internet.email(),
            password: await bcrypt.hash("password123", 10),
            name: faker.person.fullName(),
            sso: `ASC${String(index + 1).padStart(3, "0")}`,
            role: "ASSOCIATE",
          },
        });
      })
  );

  console.log("Created associates");

  // Create time punches
  const reasons = [
    "FORGOT_TIME_CARD",
    "LOST_TIME_CARD",
    "FORGOT_TO_PUNCH",
    "IN_THE_FIELD",
    "OTHER",
  ];
  const timePunches = await Promise.all(
    associates.flatMap((associate) =>
      Array(faker.number.int({ min: 1, max: 5 }))
        .fill(null)
        .map(async () => {
          const date = faker.date.recent({ days: 30 });
          const supervisor = faker.helpers.arrayElement(supervisors);
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
