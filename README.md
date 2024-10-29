# MissPunch

A modern time record management system for handling compensable time records efficiently.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadcnUI](https://ui.shadcn.com/) components
- **Database**: PostgreSQL via [Neon](https://neon.tech)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Type Safety**: TypeScript

## Features

- Digital time record form submission
- Digital signature capture
- Multiple themes (Day, Night, Ocean, Volcano, Nature)
- Print-friendly layouts
- Role-based access control
- Audit logging
- Secure data storage

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Update DATABASE_URL in .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Deployment

1. **Database Setup**

   - Create a new Neon database
   - Update DATABASE_URL in your deployment environment

2. **Deploy to Production**

   ```bash
   # Build the application
   npm run build

   # Start production server
   npm start
   ```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── ...          # Feature-specific components
├── lib/             # Utility functions
└── prisma/          # Database schema and migrations
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## License

See [LICENSE](LICENSE) for more information.
