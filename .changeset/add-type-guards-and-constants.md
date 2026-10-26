---
"@lumio/shared": minor
---

Add type-safe constants and validation guards for ProposalStatus, VoteChoice, and ContractName. Adds PROPOSAL_STATUSES and VOTE_CHOICES constant arrays with derived types, plus isProposalStatus(), isVoteChoice(), and isContractName() type guards for validating untrusted string inputs.
