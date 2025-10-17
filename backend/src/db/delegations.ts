import { pool } from './index.js';

interface Delegation {
  delegate: string;
  delegator: string;
  authority: string;
  caveats: any[];
  salt: string;
  signature: string;
}

/**
 * Store a signed delegation for a user
 */
export async function storeDelegation(
  userAddress: string,
  delegation: Delegation
): Promise<void> {
  const normalizedAddress = userAddress.toLowerCase();

  await pool.query(
    `
    INSERT INTO delegations (user_address, delegation, updated_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (user_address)
    DO UPDATE SET 
      delegation = $2,
      updated_at = NOW()
    `,
    [normalizedAddress, JSON.stringify(delegation)]
  );
}

/**
 * Retrieve a stored delegation for a user
 */
export async function getDelegation(userAddress: string): Promise<Delegation | null> {
  const normalizedAddress = userAddress.toLowerCase();

  const result = await pool.query(
    'SELECT delegation FROM delegations WHERE user_address = $1',
    [normalizedAddress]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].delegation as Delegation;
}

/**
 * Check if a user has a delegation stored
 */
export async function hasDelegation(userAddress: string): Promise<boolean> {
  const normalizedAddress = userAddress.toLowerCase();

  const result = await pool.query(
    'SELECT 1 FROM delegations WHERE user_address = $1',
    [normalizedAddress]
  );

  return result.rows.length > 0;
}

/**
 * Delete a user's delegation
 */
export async function deleteDelegation(userAddress: string): Promise<void> {
  const normalizedAddress = userAddress.toLowerCase();

  await pool.query(
    'DELETE FROM delegations WHERE user_address = $1',
    [normalizedAddress]
  );
}
