# Drizzle Database Setup Guide

## 🚀 Quick Setup

Your ocean hazard messaging app now uses **Drizzle ORM** for type-safe database operations with Supabase PostgreSQL.

### 1. Environment Setup

Update your `.env.local` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database Connection String
# Get this from: Supabase Dashboard > Settings > Database > Connection string > Nodejs
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

### 2. Database Schema Deployment

Choose one of these methods to deploy your schema:

#### Method A: Direct Push (Recommended for development)
```bash
npm run db:push
```

#### Method B: Generate and Run Migrations
```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

### 3. Available Commands

```bash
# Push schema directly to database (development)
npm run db:push

# Generate migration files from schema changes
npm run db:generate

# Run pending migrations
npm run db:migrate

# Open Drizzle Studio (database browser)
npm run db:studio

# Legacy setup script
npm run setup-db
```

## 📊 Database Schema

### Tables Created:

1. **users** - User profiles and authentication
2. **conversations** - Chat conversation containers
3. **conversation_participants** - Many-to-many relationship for users in conversations
4. **messages** - Individual chat messages
5. **posts** - Ocean hazard reports (existing)

### Key Features:

- ✅ **Type Safety** - Full TypeScript support
- ✅ **Real-time Ready** - Compatible with Supabase real-time
- ✅ **Optimized** - Proper indexing for performance
- ✅ **Scalable** - Supports group conversations
- ✅ **Relationships** - Proper foreign key constraints

## 🔧 Usage in Code

### Import Database Connection:
```typescript
import { db } from '@/utils/db';
import { users, messages, conversations } from '@/utils/db/schema';
```

### Example Queries:

```typescript
// Get user by Supabase ID
const user = await db.select().from(users).where(eq(users.supabaseId, userId));

// Create new conversation
const conversation = await db.insert(conversations).values({}).returning();

// Send message
await db.insert(messages).values({
  conversationId: conversationId,
  senderId: senderId,
  content: messageContent,
});

// Get conversation messages
const messages = await db
  .select()
  .from(messages)
  .where(eq(messages.conversationId, conversationId))
  .orderBy(messages.createdAt);
```

## 🎯 Next Steps

1. **Deploy Schema**: Run `npm run db:push`
2. **Enable Real-time**: In Supabase Dashboard > Database > Replication, enable real-time for `messages` table
3. **Test Messaging**: Your app should now support real-time messaging!

## 🔍 Troubleshooting

### Common Issues:

1. **Connection Error**: Verify your DATABASE_URL is correct
2. **Permission Error**: Ensure your Supabase service role key has the right permissions
3. **Schema Conflicts**: Run `npm run db:push` to sync schema changes

### Getting Help:

- Check Drizzle logs in terminal
- Use `npm run db:studio` to inspect your database
- Verify Supabase connection in dashboard

## 📝 Schema Management

### Making Changes:

1. Update `src/utils/db/schema.ts`
2. Run `npm run db:generate` (for migrations) or `npm run db:push` (for direct deploy)
3. Test your changes

### Best Practices:

- Use migrations for production
- Use `db:push` for development
- Always backup before major schema changes
- Test locally before deploying

Your messaging system is now powered by Drizzle ORM with full type safety and optimal performance! 🎉
