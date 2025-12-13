# Quick Migration Guide - Hook Updates

## ⚠️ Breaking Changes

All data fetching hooks now return **objects** instead of raw arrays/values.

---

## Before & After Examples

### useOrganizations

```typescript
// ❌ OLD
const organizations = useOrganizations();
organizations.map(org => ...)

// ✅ NEW
const { organizations, loading, error } = useOrganizations();
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
organizations.map(org => ...)
```

### useUsers

```typescript
// ❌ OLD
const users = useUsers(orgId, restId, refresh);
users.filter(...)

// ✅ NEW
const { users, loading, error } = useUsers(orgId, restId, refresh);
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
users.filter(...)
```

### useRestaurants

```typescript
// ❌ OLD
const restaurants = useRestaurants(orgId, refresh);
restaurants.find(...)

// ✅ NEW
const { restaurants, loading, error } = useRestaurants(orgId, refresh);
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
restaurants.find(...)
```

### useAbrechnungen

```typescript
// ❌ OLD
const abrechnungen = useAbrechnungen([dep1, dep2]);
abrechnungen.length

// ✅ NEW
const { abrechnungen, loading, error } = useAbrechnungen({
  restaurantId: restId,
  geschaeftsDag: date,
  refresh: counter
});
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
abrechnungen.length
```

---

## Files That Need Updates

Search for these patterns and update them:

1. **OrganizationsSection.tsx**
   - Find: `useOrganizations()`
   - Update to destructure return value

2. **UsersSection.tsx**
   - Find: `useUsers(...)`
   - Update to destructure return value

3. **RestaurantsSection.tsx**
   - Find: `useRestaurants(...)`
   - Update to destructure return value

4. **AbrechnungenSection.tsx**
   - Find: `useAbrechnungen(...)`
   - Update to destructure return value

---

## Search & Replace Pattern

**Search in your code for:**
```
const \w+ = use(Organizations|Users|Restaurants|Abrechnungen)
```

**Replace with:**
```
const { data, loading, error } = use$1
```

Then rename `data` to the appropriate variable name.

---

## Testing After Migration

```bash
# Run dev server
npm run dev

# Check each admin dashboard tab:
1. Firmen (Organizations)
2. Restaurants
3. Benutzern (Users)
4. Abrechnungen

# Look for:
- Loading states show briefly
- Data displays correctly
- No console errors
- TypeScript compilation succeeds
```

---

## Benefits You Get

✅ **Loading States** - Show spinners while fetching
✅ **Error Handling** - Display error messages to users
✅ **Type Safety** - Full TypeScript support
✅ **Memory Leaks Fixed** - Requests cancel on unmount
✅ **Better DX** - Consistent API across all hooks
