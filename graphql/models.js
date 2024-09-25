const Product = require('../rest/db/models/product.js');

const resolvers = {
    // Resolver to fetch all products
    products: async () => {
        try {
            return await Product.find({});
        } catch (err) {
            throw new Error('Error fetching products');
        }
    },

    // Resolver to fetch a single product by ID
    product: async ({ id }) => {
        try {
            return await Product.findById(id);
        } catch (err) {
            throw new Error('Error fetching product');
        }
    },

    // Resolver to create a new product
    addProduct: async (args) => {
        const newProduct = new Product({
            name: args.input.name,
            sku: args.input.sku,
            description: args.input.description,
            price: args.input.price,
            category: args.input.category,
            manufacturer: args.input.manufacturer,
            amountInStock: args.input.amountInStock,
        });

        try {
            return await newProduct.save();
        } catch (err) {
            throw new Error('Error creating product');
        }
    },

    // Resolver to update an existing product
    updateProduct: async ({ id, input }) => {
        try {
            return await Product.findByIdAndUpdate(id, input, { new: true });
        } catch (err) {
            throw new Error('Error updating product');
        }
    },  

    // Resolver to delete a product
    deleteProduct: async ({ id }) => {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            if (!deletedProduct) {
                throw new Error('Product not found');
            }
            return deletedProduct;
        } catch (err) {
            throw new Error('Error deleting product');
        }
    },

    // Resolver to calculate the total stock value
    totalStockValue: async () => {
        try {
            const products = await Product.find({});
            const totalValue = products.reduce((sum, product) => {
                return sum + (product.price * product.amountInStock);
            }, 0);
            return totalValue;
        } catch (err) {
            throw new Error('Error calculating total stock value');
        }
    },

    // Resolver to calculate total stock value by manufacturer
    totalStockValueByManufacturer: async () => {
        try {
            const products = await Product.find({});
            const manufacturerTotals = {};

            products.forEach((product) => {
                const manufacturerName = product.manufacturer.name;
                const productValue = product.price * product.amountInStock;

                if (!manufacturerTotals[manufacturerName]) {
                    manufacturerTotals[manufacturerName] = 0;
                }
                manufacturerTotals[manufacturerName] += productValue;
            });

            return Object.keys(manufacturerTotals).map(manufacturer => ({
                manufacturer,
                totalValue: manufacturerTotals[manufacturer]
            }));
        } catch (err) {
            throw new Error('Error calculating stock value by manufacturer');
        }
    },

    // Resolver to fetch products with less than 10 units in stock
    lowStockProducts: async () => {
        try {
            return await Product.find({ amountInStock: { $lt: 10 } });
        } catch (err) {
            throw new Error('Error fetching low stock products');
        }
    },

    // Resolver to fetch products with less than 5 units in stock (compact version)
    criticalStockProducts: async () => {
        try {
            const products = await Product.find({ amountInStock: { $lt: 5 } });
            return products.map(product => ({
                manufacturer: product.manufacturer.name,
                contact: product.manufacturer.contact
            }));
        } catch (err) {
            throw new Error('Error fetching critical stock products');
        }
    },

    // Resolver to fetch a list of all manufacturers
    manufacturers: async () => {
        try {
            const products = await Product.find({});
            const manufacturers = new Set();

            products.forEach(product => {
                manufacturers.add(JSON.stringify(product.manufacturer));
            });

            return Array.from(manufacturers).map(manufacturer => JSON.parse(manufacturer));
        } catch (err) {
            throw new Error('Error fetching manufacturers');
        }
    },
};

module.exports = resolvers;