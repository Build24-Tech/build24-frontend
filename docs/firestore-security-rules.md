# Firestore Security Rules Documentation

## Overview

This document describes the Firestore security rules implemented for the user profile system in Build24. The security rules enforce proper access control for user profiles, follow relationships, and privacy settings.

## Security Rules Structure

### User Profile Access Control

The security rules for user profiles (`/users/{userId}`) implement the following access patterns:

#### Read Access
- Users can read their own profile
- Authenticated users can read public profiles
- Private profiles are only accessible to the profile owner

#### Write Access
- Users can only create and update their own profile
- Profile data must pass validation checks
- Certain fields (uid, createdAt) are immutable after creation

#### Validation Rules
- Email format validation using regex
- URL format validation for website fields
- Field length limits (bio: 500 chars, location: 100 chars, etc.)
- Required fields validation
- Data type validation

### Follow System Access Control

The security rules for follow relationships (`/userFollows/{followId}`) implement:

#### Read Access
- All authenticated users can read follow relationships
- This enables displaying follower/following lists and checking follow status

#### Write Access
- Users can only create follow relationships where they are the follower
- Users cannot follow themselves
- Users can only delete their own follow relationships
- Users can update their own follow relationships (e.g., to block)

#### Validation Rules
- Document ID must match the pattern `{followerId}_{followingId}`
- Required fields: followerId, followingId, createdAt, status
- Status must be either 'active' or 'blocked'
- Both users must exist in the database

## Security Rules Implementation

### Helper Functions

```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

function isValidEmail(email) {
  return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
}

function isValidUrl(url) {
  return url.matches('^https?://[^\\s/$.?#].[^\\s]*$');
}

function isValidProfileData(data) {
  // Validates profile data structure and field constraints
}

function isValidUserData(data) {
  // Validates complete user document structure
}
```

### User Collection Rules

```javascript
match /users/{userId} {
  // Read: Own profile OR public profiles
  allow read: if isOwner(userId) || 
                 (isAuthenticated() && 
                  exists(/databases/$(database)/documents/users/$(userId)) &&
                  get(/databases/$(database)/documents/users/$(userId)).data.profile.isPublic == true);
  
  // Create: Only own profile with valid data
  allow create: if isOwner(userId) && 
                   isValidUserData(request.resource.data) &&
                   request.resource.data.uid == userId;
  
  // Update: Only own profile with valid data and immutable fields preserved
  allow update: if isOwner(userId) && 
                   isValidUserData(request.resource.data) &&
                   request.resource.data.uid == userId &&
                   request.resource.data.uid == resource.data.uid &&
                   request.resource.data.createdAt == resource.data.createdAt;
  
  // Delete: Only own profile
  allow delete: if isOwner(userId);
}
```

### Follow Collection Rules

```javascript
match /userFollows/{followId} {
  // Read: All authenticated users
  allow read: if isAuthenticated();
  
  // Create: Only follower can create, cannot follow self, both users must exist
  allow create: if isAuthenticated() && 
                   request.resource.data.followerId == request.auth.uid &&
                   request.resource.data.followingId != request.auth.uid &&
                   // ... additional validation
  
  // Update: Only follower can update their relationships
  allow update: if isAuthenticated() && 
                   resource.data.followerId == request.auth.uid &&
                   // ... preserve immutable fields
  
  // Delete: Only follower can delete (unfollow)
  allow delete: if isAuthenticated() && 
                   resource.data.followerId == request.auth.uid;
}
```

## Testing Security Rules

### Prerequisites

1. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Login**: Authenticate with Firebase
   ```bash
   firebase login
   ```

3. **Project Dependencies**: Ensure testing dependencies are installed
   ```bash
   npm install
   ```

### Running Tests

#### Option 1: Using Firebase Emulator (Recommended)

1. Start the Firebase emulator:
   ```bash
   firebase emulators:start --only firestore
   ```

2. In another terminal, run the tests:
   ```bash
   npm test __tests__/firestore-security-rules.test.ts
   ```

#### Option 2: Using Firebase Emulator Exec

Run tests with automatic emulator management:
```bash
firebase emulators:exec --only firestore "npm test __tests__/firestore-security-rules.test.ts"
```

#### Option 3: Using the Deployment Script

The deployment script includes test execution:
```bash
./scripts/deploy-security-rules.sh
```

### Test Coverage

The security rules tests cover:

#### User Profile Access Control
- ✅ Users can create their own profile
- ✅ Users cannot create profiles for others
- ✅ Users can read their own profile
- ✅ Users can read public profiles
- ✅ Users cannot read private profiles
- ✅ Users can update their own profile
- ✅ Users cannot update other users' profiles
- ✅ Profile data validation on create
- ✅ Field length validation
- ✅ URL format validation

#### Follow System Access Control
- ✅ Users can follow other users
- ✅ Users cannot follow themselves
- ✅ Users cannot create follow relationships for others
- ✅ Authenticated users can read follow relationships
- ✅ Unauthenticated users cannot read follow relationships
- ✅ Users can unfollow (delete relationships)
- ✅ Users cannot delete others' follow relationships
- ✅ Follow relationship data structure validation
- ✅ Follow relationship status validation
- ✅ Users can update their own follow relationships

#### Privacy Controls
- ✅ Profile privacy settings enforcement
- ✅ Email visibility controls validation

## Validation and Deployment

### Validation Script

Run the validation script to check rules syntax and structure:
```bash
node scripts/validate-security-rules.js
```

This script checks:
- Rules version and syntax
- Required helper functions
- Collection rule coverage
- Security best practices
- Test file structure
- Package dependencies

### Deployment Script

Deploy rules to Firebase:
```bash
./scripts/deploy-security-rules.sh [environment] [skip-tests]
```

Examples:
```bash
# Deploy to default project with tests
./scripts/deploy-security-rules.sh

# Deploy to staging with tests
./scripts/deploy-security-rules.sh my-project-staging

# Deploy to production without tests
./scripts/deploy-security-rules.sh my-project-prod true
```

The deployment script:
1. Validates rules syntax
2. Creates backup of existing rules
3. Runs security tests (optional)
4. Deploys rules to Firebase
5. Provides verification links

## Security Considerations

### Data Privacy
- Profile privacy is enforced at the database level
- Private profiles are completely inaccessible to other users
- Email visibility is controlled by user preference
- Follow relationships respect profile privacy

### Access Control
- All write operations require authentication
- Users can only modify their own data
- Ownership validation prevents privilege escalation
- Follow relationships prevent self-following

### Data Validation
- Comprehensive input validation prevents malformed data
- Field length limits prevent abuse
- URL validation ensures safe external links
- Email format validation ensures data quality

### Performance Considerations
- Rules use efficient existence checks
- Composite queries are optimized for common access patterns
- Follow relationship queries support pagination
- Profile visibility checks are cached-friendly

## Troubleshooting

### Common Issues

1. **Emulator Not Running**
   - Error: "The host and port of the firestore emulator must be specified"
   - Solution: Start Firebase emulator before running tests

2. **Authentication Errors**
   - Error: "Not logged in to Firebase"
   - Solution: Run `firebase login`

3. **Rules Deployment Fails**
   - Check rules syntax with validation script
   - Verify Firebase project permissions
   - Ensure correct project ID

4. **Tests Fail**
   - Verify emulator is running on correct port
   - Check test environment setup
   - Ensure all dependencies are installed

### Debug Mode

Enable debug logging for rules:
```bash
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIRESTORE_EMULATOR_DEBUG=true
```

### Firebase Console

Monitor rules in production:
- Firestore Rules: https://console.firebase.google.com/project/[PROJECT_ID]/firestore/rules
- Storage Rules: https://console.firebase.google.com/project/[PROJECT_ID]/storage/rules

## Best Practices

1. **Always Test Rules**: Run comprehensive tests before deployment
2. **Use Validation Scripts**: Validate syntax and structure regularly
3. **Monitor Performance**: Check rule evaluation performance in production
4. **Regular Backups**: Backup rules before major changes
5. **Staged Deployment**: Test in staging before production deployment
6. **Security Reviews**: Regular security audits of rules and access patterns

## Related Documentation

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Build24 User Profile System Design](./user-profile-system-design.md)
