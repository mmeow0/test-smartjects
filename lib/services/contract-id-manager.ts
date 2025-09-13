/**
 * Contract ID Manager
 *
 * Manages persistent mapping between platform contract IDs and blockchain contract IDs.
 * Currently uses localStorage as storage, can be easily migrated to database later.
 */

export interface ContractIdMapping {
  contractId: string;
  blockchainId: number;
  createdAt: number;
  transactionHash?: string;
  status?: 'pending' | 'confirmed' | 'failed';
}

export class ContractIdManager {
  private static readonly STORAGE_KEY = 'smartjects_contract_id_mappings';
  private static readonly NEXT_ID_KEY = 'smartjects_next_contract_id';
  private static readonly VERSION_KEY = 'smartjects_mappings_version';
  private static readonly CURRENT_VERSION = '1.0';

  /**
   * Get all contract ID mappings from storage
   */
  static getMappings(): Map<string, ContractIdMapping> {
    try {
      // Check version compatibility
      const version = localStorage.getItem(this.VERSION_KEY);
      if (version && version !== this.CURRENT_VERSION) {
        console.warn(`⚠️ Contract mappings version mismatch. Current: ${this.CURRENT_VERSION}, Stored: ${version}`);
        // Could implement migration logic here if needed
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        console.log('📋 No existing contract mappings found, starting fresh');
        return new Map();
      }

      const data = JSON.parse(stored);
      const mappings = new Map<string, ContractIdMapping>();

      // Convert array back to Map and validate data
      if (Array.isArray(data)) {
        for (const [contractId, mapping] of data) {
          if (this.validateMapping(mapping)) {
            mappings.set(contractId, mapping);
          } else {
            console.warn(`⚠️ Invalid mapping data for contract ${contractId}:`, mapping);
          }
        }
      }

      console.log(`📋 Loaded ${mappings.size} contract ID mappings from storage`);
      return mappings;
    } catch (error) {
      console.error('❌ Error loading contract mappings:', error);
      console.log('📋 Falling back to empty mappings');
      return new Map();
    }
  }

  /**
   * Save all mappings to storage
   */
  static saveMappings(mappings: Map<string, ContractIdMapping>): void {
    try {
      // Convert Map to array for JSON serialization
      const data = Array.from(mappings.entries());

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);

      console.log(`💾 Saved ${mappings.size} contract ID mappings to storage`);
    } catch (error) {
      console.error('❌ Error saving contract mappings:', error);

      // Check if localStorage is full
      if (error instanceof DOMException && error.code === 22) {
        console.error('💾 localStorage is full. Consider implementing database storage.');
        this.clearOldMappings();
      }
    }
  }

  /**
   * Set mapping for a contract
   */
  static setMapping(
    contractId: string,
    blockchainId: number,
    transactionHash?: string,
    status: 'pending' | 'confirmed' | 'failed' = 'confirmed'
  ): void {
    const mappings = this.getMappings();

    const mapping: ContractIdMapping = {
      contractId,
      blockchainId,
      createdAt: Date.now(),
      transactionHash,
      status
    };

    mappings.set(contractId, mapping);
    this.saveMappings(mappings);

    console.log(`📝 Set contract mapping: ${contractId} -> blockchain ID ${blockchainId} (${status})`);

    // Update next contract ID
    this.updateNextContractId(blockchainId);
  }

  /**
   * Get blockchain ID for a contract
   */
  static getBlockchainId(contractId: string): number | null {
    const mappings = this.getMappings();
    const mapping = mappings.get(contractId);

    if (!mapping) {
      console.warn(`⚠️ No blockchain ID found for contract ${contractId}`);
      console.log(`📊 Available contracts: ${Array.from(mappings.keys()).join(', ') || 'none'}`);
      return null;
    }

    console.log(`✅ Found blockchain ID ${mapping.blockchainId} for contract ${contractId}`);
    return mapping.blockchainId;
  }

  /**
   * Get contract mapping details
   */
  static getMapping(contractId: string): ContractIdMapping | null {
    const mappings = this.getMappings();
    return mappings.get(contractId) || null;
  }

  /**
   * Get all contract IDs mapped to a specific blockchain ID
   */
  static getContractIdsByBlockchainId(blockchainId: number): string[] {
    const mappings = this.getMappings();
    const contractIds: string[] = [];

    for (const [contractId, mapping] of mappings) {
      if (mapping.blockchainId === blockchainId) {
        contractIds.push(contractId);
      }
    }

    return contractIds;
  }

  /**
   * Remove mapping for a contract
   */
  static removeMapping(contractId: string): boolean {
    const mappings = this.getMappings();
    const existed = mappings.has(contractId);

    if (existed) {
      mappings.delete(contractId);
      this.saveMappings(mappings);
      console.log(`🗑️ Removed mapping for contract ${contractId}`);
    } else {
      console.warn(`⚠️ No mapping found to remove for contract ${contractId}`);
    }

    return existed;
  }

  /**
   * Update contract mapping status
   */
  static updateMappingStatus(
    contractId: string,
    status: 'pending' | 'confirmed' | 'failed',
    transactionHash?: string
  ): boolean {
    const mappings = this.getMappings();
    const mapping = mappings.get(contractId);

    if (!mapping) {
      console.warn(`⚠️ Cannot update status: No mapping found for contract ${contractId}`);
      return false;
    }

    mapping.status = status;
    if (transactionHash) {
      mapping.transactionHash = transactionHash;
    }

    mappings.set(contractId, mapping);
    this.saveMappings(mappings);

    console.log(`📝 Updated contract ${contractId} status to: ${status}`);
    return true;
  }

  /**
   * Get next available contract ID
   */
  static getNextContractId(): number {
    try {
      const stored = localStorage.getItem(this.NEXT_ID_KEY);
      const nextId = stored ? parseInt(stored, 10) : 1;

      // Ensure it's a valid number
      return isNaN(nextId) ? 1 : Math.max(1, nextId);
    } catch (error) {
      console.error('❌ Error getting next contract ID:', error);
      return 1;
    }
  }

  /**
   * Update next available contract ID
   */
  static updateNextContractId(usedId: number): void {
    const currentNext = this.getNextContractId();
    const newNext = Math.max(currentNext, usedId + 1);

    if (newNext !== currentNext) {
      localStorage.setItem(this.NEXT_ID_KEY, newNext.toString());
      console.log(`📊 Updated next contract ID to: ${newNext}`);
    }
  }

  /**
   * Get all mappings as array for display/debugging
   */
  static getAllMappings(): ContractIdMapping[] {
    const mappings = this.getMappings();
    return Array.from(mappings.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get mapping statistics
   */
  static getStats(): {
    totalMappings: number;
    pendingMappings: number;
    confirmedMappings: number;
    failedMappings: number;
    nextContractId: number;
  } {
    const mappings = this.getMappings();
    const all = Array.from(mappings.values());

    return {
      totalMappings: all.length,
      pendingMappings: all.filter(m => m.status === 'pending').length,
      confirmedMappings: all.filter(m => m.status === 'confirmed').length,
      failedMappings: all.filter(m => m.status === 'failed').length,
      nextContractId: this.getNextContractId()
    };
  }

  /**
   * Clear all mappings (use with caution)
   */
  static clearAllMappings(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.NEXT_ID_KEY);
    localStorage.removeItem(this.VERSION_KEY);
    console.log('🗑️ Cleared all contract ID mappings');
  }

  /**
   * Clear old mappings (older than 30 days) to free up space
   */
  static clearOldMappings(): void {
    const mappings = this.getMappings();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let removedCount = 0;

    for (const [contractId, mapping] of mappings) {
      if (mapping.createdAt < thirtyDaysAgo && mapping.status !== 'pending') {
        mappings.delete(contractId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.saveMappings(mappings);
      console.log(`🗑️ Cleared ${removedCount} old contract mappings`);
    }
  }

  /**
   * Validate mapping data structure
   */
  private static validateMapping(mapping: any): mapping is ContractIdMapping {
    return (
      typeof mapping === 'object' &&
      mapping !== null &&
      typeof mapping.contractId === 'string' &&
      typeof mapping.blockchainId === 'number' &&
      typeof mapping.createdAt === 'number' &&
      mapping.blockchainId > 0 &&
      mapping.createdAt > 0
    );
  }

  /**
   * Export mappings for backup/migration
   */
  static exportMappings(): string {
    const mappings = this.getMappings();
    const data = {
      version: this.CURRENT_VERSION,
      exportedAt: Date.now(),
      nextContractId: this.getNextContractId(),
      mappings: Array.from(mappings.entries())
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import mappings from backup/migration
   */
  static importMappings(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (!data.mappings || !Array.isArray(data.mappings)) {
        throw new Error('Invalid import data format');
      }

      const mappings = new Map<string, ContractIdMapping>();
      let validCount = 0;

      for (const [contractId, mapping] of data.mappings) {
        if (this.validateMapping(mapping)) {
          mappings.set(contractId, mapping);
          validCount++;
        }
      }

      this.saveMappings(mappings);

      if (data.nextContractId && typeof data.nextContractId === 'number') {
        localStorage.setItem(this.NEXT_ID_KEY, data.nextContractId.toString());
      }

      console.log(`✅ Imported ${validCount} contract mappings`);
      return true;
    } catch (error) {
      console.error('❌ Error importing mappings:', error);
      return false;
    }
  }

  /**
   * Debug: Log current state
   */
  static logCurrentState(): void {
    const stats = this.getStats();
    const mappings = this.getMappings();

    console.group('📊 Contract ID Manager State');
    console.log('Statistics:', stats);
    console.log('All mappings:', Array.from(mappings.entries()));
    console.groupEnd();
  }
}
