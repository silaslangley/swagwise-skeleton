// Require mongoose dependency
var mongoose = require('mongoose');

// Create a swag schema
var swagSchema = mongoose.Schema({
    id: Number,
    isFeatured: Boolean,
    isActive: Boolean,
    price: Number,
    specialPrice: Number,
    inventory: Number,
    title: String,
    manufacturer: String,
    description: String,
    dateCreated: { type: Date, default: Date.now },
    dateUpdated: { type: Date, default: Date.now },
    images: Array,
    colors: Array,
    tags: Array
});

// Register the Product model and schema with mongoose
mongoose.model('Product', swagSchema, 'products');