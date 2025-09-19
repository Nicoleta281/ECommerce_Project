# Public API Documentation

Aceste API-uri sunt publice și pot fi folosite în frontend-ul tău fără autentificare.

## Base URL
```
http://localhost:3000/api/public
```

## Endpoints

### 1. Products

#### Get All Products
```
GET /api/public/[storeId]/products
```

**Query Parameters:**
- `categoryId` (optional) - Filter by category
- `colorId` (optional) - Filter by color  
- `sizeId` (optional) - Filter by size
- `isFeatured` (optional) - Filter featured products

**Example:**
```
GET /api/public/your-store-id/products?isFeatured=true
GET /api/public/your-store-id/products?categoryId=category-id
```

#### Get Single Product
```
GET /api/public/[storeId]/products/[productId]
```

### 2. Categories
```
GET /api/public/[storeId]/categories
```

### 3. Billboards
```
GET /api/public/[storeId]/billboards
```

### 4. Sizes
```
GET /api/public/[storeId]/sizes
```

### 5. Colors
```
GET /api/public/[storeId]/colors
```

### 6. Orders (Checkout)

#### Create Order
```
POST /api/public/[storeId]/orders
```

**Body:**
```json
{
  "orderItems": [
    { "productId": "product-id-1" },
    { "productId": "product-id-2" }
  ],
  "phone": "+1234567890",
  "address": "123 Main St, City, Country"
}
```

### 7. Store Info
```
GET /api/public/stores/[storeId]
```

## Response Format

Toate API-urile returnează JSON cu următoarea structură:

**Success:**
```json
{
  "data": [...],
  "message": "Success"
}
```

**Error:**
```json
{
  "error": "Error message",
  "status": 400
}
```

## Usage Examples

### Frontend JavaScript/React

```javascript
// Get all products
const products = await fetch('/api/public/your-store-id/products')
  .then(res => res.json());

// Get featured products
const featuredProducts = await fetch('/api/public/your-store-id/products?isFeatured=true')
  .then(res => res.json());

// Get products by category
const categoryProducts = await fetch('/api/public/your-store-id/products?categoryId=category-id')
  .then(res => res.json());

// Get single product
const product = await fetch('/api/public/your-store-id/products/product-id')
  .then(res => res.json());

// Create order
const order = await fetch('/api/public/your-store-id/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderItems: [
      { productId: 'product-id-1' },
      { productId: 'product-id-2' }
    ],
    phone: '+1234567890',
    address: '123 Main St, City, Country'
  })
}).then(res => res.json());
```

## Notes

- Toate API-urile publice sunt read-only, cu excepția orders
- Nu este necesară autentificare
- Store ID-ul trebuie să fie valid
- Produsele arhivate nu sunt returnate
- Orders sunt create cu `isPaid: false` inițial
