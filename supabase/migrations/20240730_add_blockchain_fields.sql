-- Add blockchain fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS wallet_connected_at TIMESTAMPTZ;

-- Add index for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- Add blockchain fields to contracts table
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS blockchain_address TEXT,
ADD COLUMN IF NOT EXISTS blockchain_deployed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS blockchain_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS escrow_funded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS escrow_funded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS escrow_amount DECIMAL(20, 8);

-- Add index for blockchain address lookups
CREATE INDEX IF NOT EXISTS idx_contracts_blockchain_address ON contracts(blockchain_address);

-- Add check constraint for blockchain status
ALTER TABLE contracts
ADD CONSTRAINT chk_blockchain_status
CHECK (blockchain_status IN ('pending', 'deployed', 'funded', 'completed', 'refunded', 'failed'));

-- Add comment for documentation
COMMENT ON COLUMN users.wallet_address IS 'Ethereum/Polygon wallet address of the user';
COMMENT ON COLUMN contracts.blockchain_address IS 'Address of the deployed escrow smart contract';
COMMENT ON COLUMN contracts.blockchain_status IS 'Status of the blockchain contract: pending, deployed, funded, completed, refunded, failed';
COMMENT ON COLUMN contracts.escrow_funded IS 'Whether the escrow contract has been funded by the client';
COMMENT ON COLUMN contracts.escrow_amount IS 'Amount locked in escrow in native currency (ETH/MATIC)';

-- Create a function to validate wallet address format
CREATE OR REPLACE FUNCTION is_valid_eth_address(address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if address matches Ethereum address format (0x followed by 40 hex characters)
    RETURN address ~ '^0x[a-fA-F0-9]{40}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add constraint to validate wallet address format
ALTER TABLE users
ADD CONSTRAINT chk_wallet_address_format
CHECK (wallet_address IS NULL OR is_valid_eth_address(wallet_address));

ALTER TABLE contracts
ADD CONSTRAINT chk_blockchain_address_format
CHECK (blockchain_address IS NULL OR is_valid_eth_address(blockchain_address));

-- Create a view for contracts with blockchain info
CREATE OR REPLACE VIEW contracts_with_blockchain AS
SELECT
    c.*,
    u_provider.wallet_address as provider_wallet,
    u_needer.wallet_address as needer_wallet,
    CASE
        WHEN c.blockchain_address IS NOT NULL AND c.escrow_funded = TRUE THEN 'active'
        WHEN c.blockchain_address IS NOT NULL AND c.escrow_funded = FALSE THEN 'awaiting_funding'
        WHEN c.blockchain_address IS NULL THEN 'not_deployed'
        ELSE 'unknown'
    END as blockchain_readiness
FROM contracts c
LEFT JOIN users u_provider ON c.provider_id = u_provider.id
LEFT JOIN users u_needer ON c.needer_id = u_needer.id;

-- Grant permissions
GRANT SELECT ON contracts_with_blockchain TO authenticated;
GRANT SELECT ON contracts_with_blockchain TO anon;
