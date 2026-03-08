

## Fix Trust Score to Start at 0/100

**Problem**: The trust score shows 37/100 because the formula gives 20 points just for being registered, plus 15 for having a product, plus 2 for product count. The user wants it to start at 0.

**Change**: In `src/hooks/useSupplierDashboardData.ts`, remove the 20-point registration baseline and the 15-point "has products" bonus. Redistribute weight so the score is purely earned through meaningful activity:

- 0 baseline (was 20)
- 0 for just having products (was 15)  
- `min(productCount, 10) * 3` — up to 30 for catalog size
- `(avgRating / 5) * 30` — up to 30 for ratings
- `min(rfqCount, 5) * 4` — up to 20 for RFQ responses
- `min(completedOrders, 5) * 4` — up to 20 for completed orders

This means a supplier with only 1 product and no reviews/orders/RFQs will score **3/100** instead of 37.

**File**: `src/hooks/useSupplierDashboardData.ts` (lines 132-139)

