# TODO: Implement Validation System for Payroll Management Application

## Backend Updates
- [ ] Update user.validator.ts: Add strong password regex, make entrepriseId required for non-super-admin
- [ ] Update employe.validator.ts: Make email optional
- [ ] Update entreprise.validator.ts: Update devise and periodePaie enums
- [ ] Update cyclepaie.validator.ts: Add statut enum, remove ouvert
- [ ] Update bulletin.validator.ts: Add statut enum
- [ ] Update paiement.validator.ts: Add date <= today validation
- [ ] Ensure uniqueness checks are implemented in services (already done in auth.service.ts)
- [ ] Verify error formatting middleware (already correct)

## Frontend Updates
- [ ] Update Yup schemas in validation.schemas.js to match backend validators
- [ ] Ensure form components display backend errors using formatServerErrors and useServerErrors helpers
- [ ] Test end-to-end validation and error display

## Testing
- [ ] Test backend validation with Postman
- [ ] Test frontend form validation
- [ ] Test error synchronization between backend and frontend
