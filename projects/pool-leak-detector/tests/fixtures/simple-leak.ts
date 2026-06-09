// Simple leak test
const pool: any ***REMOVED*** { connect: async () ***REMOVED***> ({ query: async () ***REMOVED***> {}, release: () ***REMOVED***> {} }) };

async function leak() {
  const conn ***REMOVED*** await pool.connect();
  // No release - leak!
}
