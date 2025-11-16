# MongoDB Atlas Setup for Personal Use Schemas

## 🔧 **Setup Instructions**

### 1. **Update .env file with your Atlas credentials**
Replace the template in `backend/.env` with your actual MongoDB Atlas connection string:

```bash
MONGO_URI=mongodb+srv://shahkrishil1108:heIRYfBzaeVXS60y@cluster0.wmqufd.mongodb.net/quotebill-pro?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

### 2. **Atlas Database Structure**
When you run the application, these collections will be automatically created in your Atlas database:

#### **Existing Collections (Client Use):**
- `documents` - Stores client quotes and bills
- `settings` - Stores app settings and letterhead info

#### **New Collections (Personal Use):**
- `materials` - Stores personal material purchases
- `personalquotations` - Stores personal quotations

### 3. **Schema Details**

#### **Materials Collection (`materials`)**
```javascript
{
  _id: ObjectId,
  itemName: String,           // "LED Tubelight 40W"
  category: String,           // tubelights, hanging_lights, etc.
  rate: Number,               // Price per unit
  quantity: Number,           // Quantity purchased
  totalAmount: Number,        // rate × quantity
  unit: String,               // pcs, nos, meters, etc.
  supplier: String,           // Supplier name
  notes: String,              // Additional notes
  purchaseDate: Date,         // When purchased
  createdAt: Date,
  updatedAt: Date
}
```

#### **Personal Quotations Collection (`personalquotations`)**
```javascript
{
  _id: ObjectId,
  quotationName: String,      // "Office Lighting Project"
  description: String,        // Project description
  materials: [{               // Array of materials used
    materialId: ObjectId,     // Reference to materials collection
    itemName: String,
    quantity: Number,
    rate: Number,
    totalAmount: Number,
    unit: String
  }],
  totalQuotationAmount: Number, // Total quotation value
  status: String,             // draft, ready, transferred
  createdAt: Date,
  updatedAt: Date
}
```

### 4. **API Endpoints for Atlas Data**

#### **Materials:**
- `GET /api/materials` - Fetch all materials
- `POST /api/materials` - Add new material
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material

#### **Personal Quotations:**
- `GET /api/personal-quotations` - Fetch all personal quotations
- `POST /api/personal-quotations` - Create new quotation
- `PUT /api/personal-quotations/:id` - Update quotation
- `DELETE /api/personal-quotations/:id` - Delete quotation
- `POST /api/personal-quotations/:id/transfer` - Transfer to client section

#### **Statistics:**
- `GET /api/personal/stats` - Dashboard statistics

### 5. **Data Flow**
1. **Personal Use** → Add materials → Store in `materials` collection
2. **Create Quotations** → Use materials → Store in `personalquotations` collection  
3. **Transfer to Client** → Convert personal quotation → Store in `documents` collection

### 6. **Atlas Database Name**
The schemas will be created in your Atlas database. Make sure your connection string includes the correct database name (e.g., `quotebill-pro`).

## 🚀 **To Start Using**

1. Update the `.env` file with your Atlas credentials
2. Start the backend server: `node server.js` (from backend directory)
3. Start the frontend: `npm start` (from frontend/quote-bill-app directory)
4. Click "Personal Use" button to start adding materials

The new schemas will be automatically created in your MongoDB Atlas cluster when you first add data through the Personal Use section.
