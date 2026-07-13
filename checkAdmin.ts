import { db } from './src/lib/db';
import { usersAdmin } from './src/lib/db/schema';
async function test() {
  const admins = await db.select().from(usersAdmin);
  console.log(admins);
}
test();
