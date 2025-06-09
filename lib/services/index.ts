// Import all services
import { smartjectService } from "./smartject.service";
import { commentService } from "./comment.service";
import { voteService } from "./vote.service";
import { proposalService } from "./proposal.service";
import { contractService } from "./contract.service";
import { userService } from "./user.service";
import { negotiationService } from "./negotiation.service";
import { fileService } from "./file.service";
import { ndaService } from "./nda.service";

// Export individual services
export { smartjectService };
export { commentService };
export { voteService };
export { proposalService };
export { contractService };
export { userService };
export { negotiationService };
export { fileService };
export { ndaService };

// Re-export all services as a single object for easier access
export const services = {
  smartjectService,
  commentService,
  voteService,
  proposalService,
  contractService,
  userService,
  negotiationService,
  fileService,
  ndaService,
};

// Default export
export default services;