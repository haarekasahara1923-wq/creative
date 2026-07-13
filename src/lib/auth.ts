import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { usersAdmin, brokers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as any).role = token.role;
      return session;
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        const { email, password, role } = credentials as {
          email: string;
          password: string;
          role: string;
        };

        if (!email || !password) return null;

        if (role === 'admin') {
          const [admin] = await db
            .select()
            .from(usersAdmin)
            .where(eq(usersAdmin.email, email))
            .limit(1);

          if (!admin) return null;
          const valid = await bcrypt.compare(password, admin.passwordHash);
          if (!valid) return null;

          return {
            id: String(admin.id),
            email: admin.email,
            name: admin.name,
            role: 'admin',
          };
        } else {
          const [broker] = await db
            .select()
            .from(brokers)
            .where(eq(brokers.email, email))
            .limit(1);

          if (!broker) return null;
          if (broker.status === 'blocked') return null;
          const valid = await bcrypt.compare(password, broker.passwordHash);
          if (!valid) return null;

          return {
            id: String(broker.id),
            email: broker.email,
            name: broker.name || broker.email,
            role: 'broker',
          };
        }
      },
    }),
  ],
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
