TALLY
Both parents hold half. The blockchain holds the truth.
Bitcoin-anchored reimbursement verification for court-ordered co-parenting.
Tally is a compliance and verification rail — not a replacement for your court order or co-parenting platform. It anchors key reimbursement events to Bitcoin L1 via OP-Net, creating an immutable, independently verifiable audit trail while keeping all sensitive family data encrypted and private off-chain.
The Instrument
For 700 years, the British Exchequer settled debts using split tally sticks. A hazelwood rod was notched to record the amount, then split lengthwise. The creditor kept the stock — origin of stockholder. The debtor kept the foil — origin of counterfoil. Neither party could forge the record because the wood grain had to match.
Tally is the digital tally stick for co-parenting finance. Each reimbursement claim issues a unique UTXO-based encrypted bond — one instrument, held by both parties, anchored to Bitcoin L1. The bond satisfies only when both halves match.
The underlying asset being protected is not currency. It is the one asset harder than Bitcoin — the children themselves.
The Problem
Shared expense reimbursements are among the most litigated issues in active co-parenting cases. The disputes are consistent:
	∙	Was the receipt actually submitted?
	∙	Did the other parent receive timely notice?
	∙	Were objection deadlines honored?
	∙	Did reimbursement occur — and when?
	∙	Were records altered after the fact?
Existing tools (OFW, TalkingParents) maintain internal logs — but those logs are platform-controlled. Courts regularly face contradictory timelines with no neutral ground truth.
How It Works
Each reimbursement claim follows a defined state machine. Key transitions are anchored on-chain.
submitted → [objection window] → approved → paid
                    ↓                         ↓
                contested                  overdue
What goes on-chain — nothing private:
claim_id
order_version_hash
receipt_hash
timestamp
status_transition
payment_hash
What stays off-chain — encrypted, key-controlled:

Code:
receipts
notes
provider information
child details
medical or school records
bank information

Smart-Contract Logic (OP-Net)
Code:
if claim_submitted:
    open objection_window

if objection_received_before_deadline:
    status = contested

if no_objection_by_deadline:
    status = approved

if payment_not_recorded_by_due_date:
    status = overdue

if payment_confirmed:
    status = paid
    settle UTXO bond → TallyStick animation

The system automates process compliance. It does not make custody decisions.

MVP Modules



