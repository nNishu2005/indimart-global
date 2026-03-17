

## Analysis

The screenshot shows a login failure with "Invalid login credentials" for `testsupplier-feb01@test.com`. The auth logs confirm a `refresh_token_not_found` error, suggesting the session has expired or the password is incorrect.

The admin role IS correctly assigned in the database for both accounts:
- `24ed4080...` (supplier + admin)
- `9985709a...` (supplier + admin)

The problem is the **login credentials are wrong** -- the password doesn't match what's stored in auth.

## Plan

### 1. Fix login access via password reset
Since we can't read or set passwords directly, the simplest fix is to use the **Forgot Password** flow:
- Go to `/forgot-password`, enter `testsupplier-feb01@test.com`
- Check email for reset link, set a new password
- Login with the new password

### 2. Improve verification badge logic (both documents + admin approval required)
Currently `is_verified` on profiles is a simple toggle. Per your choice, verification should require:
- All uploaded documents approved (`documents.is_verified = true`)
- Explicit admin approval step

**Changes:**
- Update `VerifyDocuments.tsx`: When admin verifies all documents for a user, show a "Grant Verified Badge" button
- Update `UserManagement.tsx`: Only allow toggling verified badge if the user has at least one verified document. Show document status alongside the badge toggle
- Add a helper query to check document verification status before allowing badge

### 3. Keep admin as single fixed account
No changes needed -- admin roles are already manually assigned via database. No self-service admin creation will be added. The `assign_user_role` trigger only allows `buyer` or `supplier` roles, which is correct.

### 4. Minor security improvements
- Restrict RLS policies from `public` role to `authenticated` role on sensitive tables (the linter flagged 15+ tables with anonymous access policies)
- This is a migration to update existing policies with `TO authenticated` instead of `TO public`

## Summary of file changes
- **`src/pages/admin/UserManagement.tsx`**: Add document verification status check before badge toggle
- **`src/pages/admin/VerifyDocuments.tsx`**: Add "Grant Verified Badge" action when all docs verified
- **Database migration**: Update RLS policies to use `authenticated` role instead of `public`

