import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

/**
 * Query helper compatible with the Neon HTTP client used in this project.
 * Replaces null/undefined placeholders with literal NULL and then executes
 * the query with the remaining parameters.
 */
export async function query(text, params = []) {
  if (!params.length) return sql(text);

  let nextIndex = 1;
  const safeParams = [];
  const safeText = text.replace(/\$(\d+)/g, (_, num) => {
    const value = params[Number(num) - 1];
    if (value === null || value === undefined) return 'NULL';
    safeParams.push(value);
    return `$${nextIndex++}`;
  });

  return sql(safeText, safeParams);
}

export { sql };
