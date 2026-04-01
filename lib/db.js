import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

/**
 * Safe query helper — avoids the Neon "could not determine data type of parameter"
 * error that occurs when null values are passed in tagged template literals.
 * Builds the query string dynamically so null params are never sent to Neon.
 */
export async function query(text, params = []) {
  if (params.length === 0) return sql.unsafe(text);

  // Replace $1, $2 … placeholders that are null with literal NULL
  let i = 1;
  const safeParams = [];
  const safeText = text.replace(/\$(\d+)/g, (match, num) => {
    const idx = parseInt(num) - 1;
    if (params[idx] === null || params[idx] === undefined) return 'NULL';
    safeParams.push(params[idx]);
    return `$${i++}`;
  });

  return sql.unsafe(safeText, safeParams);
}
