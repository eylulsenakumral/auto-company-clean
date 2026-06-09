/**
 * Test fixtures for leak detection
 */

// Fixture 1: pg missing release
export function pgMissingRelease() {
  const pool: any ***REMOVED*** {};
  async function getUser(id: number) {
    const conn ***REMOVED*** await pool.connect();
    const result ***REMOVED*** await conn.query('SELECT * FROM users WHERE id ***REMOVED*** $1', [id]);
    // Missing: conn.release()
    return result;
  }
  return getUser;
}

// Fixture 2: pg loop leak
export function pgLoopLeak() {
  const pool: any ***REMOVED*** {};
  async function processItems(items: any[]) {
    for (const item of items) {
      const conn ***REMOVED*** await pool.connect();
      await process(item);
      // Missing release in loop
    }
  }
  return processItems;
}

// Fixture 3: pg proper usage (no leak)
export function pgProper() {
  const pool: any ***REMOVED*** {};
  async function getUser(id: number) {
    const conn ***REMOVED*** await pool.connect();
    try {
      const result ***REMOVED*** await conn.query('SELECT * FROM users WHERE id ***REMOVED*** $1', [id]);
      return result;
    } finally {
      conn.release();
    }
  }
  return getUser;
}

// Fixture 4: mysql2 leak
export function mysql2Leak() {
  const pool: any ***REMOVED*** {};
  async function query(sql: string) {
    const conn ***REMOVED*** await pool.getConnection();
    const result ***REMOVED*** await conn.query(sql);
    // Missing: conn.release()
    return result;
  }
  return query;
}

// Fixture 5: Prisma transaction without error handling
export function prismaLeak() {
  const prisma: any ***REMOVED*** {};
  async function createUserWithPost() {
    await prisma.$transaction(async (tx: any) ***REMOVED***> {
      await tx.user.create({ data: { name: 'John' } });
      await tx.post.create({ data: { title: 'Hello' } });
    });
    // No error handling
  }
  return createUserWithPost;
}

// Fixture 6: Prisma with error handling (no leak)
export function prismaProper() {
  const prisma: any ***REMOVED*** {};
  async function createUserWithPost() {
    try {
      await prisma.$transaction(async (tx: any) ***REMOVED***> {
        await tx.user.create({ data: { name: 'John' } });
        await tx.post.create({ data: { title: 'Hello' } });
      });
    } catch (error) {
      console.error(error);
    }
  }
  return createUserWithPost;
}
