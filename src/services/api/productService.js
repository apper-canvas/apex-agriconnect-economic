class ProductService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'product_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "cost_price_c"}},
          {"field": {"Name": "stock_quantity_c"}},
          {"field": {"Name": "min_stock_level_c"}},
          {"field": {"Name": "barcode_c"}},
          {"field": {"Name": "supplier_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "unit_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to match UI expectations
      return response.data.map(product => ({
        Id: product.Id,
        name: product.name_c || product.Name || '',
        category: product.category_c || '',
        price: product.price_c || 0,
        costPrice: product.cost_price_c || 0,
        stockQuantity: product.stock_quantity_c || 0,
        minStockLevel: product.min_stock_level_c || 0,
        barcode: product.barcode_c || '',
        supplier: product.supplier_c || '',
        description: product.description_c || '',
        unit: product.unit_c || ''
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "cost_price_c"}},
          {"field": {"Name": "stock_quantity_c"}},
          {"field": {"Name": "min_stock_level_c"}},
          {"field": {"Name": "barcode_c"}},
          {"field": {"Name": "supplier_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "unit_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error("Product not found");
      }

      const product = response.data;
      return {
        Id: product.Id,
        name: product.name_c || product.Name || '',
        category: product.category_c || '',
        price: product.price_c || 0,
        costPrice: product.cost_price_c || 0,
        stockQuantity: product.stock_quantity_c || 0,
        minStockLevel: product.min_stock_level_c || 0,
        barcode: product.barcode_c || '',
        supplier: product.supplier_c || '',
        description: product.description_c || '',
        unit: product.unit_c || ''
      };
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  async create(productData) {
    try {
      // Only include Updateable fields in create operation
      const records = [{
        Name: productData.name || '',
        name_c: productData.name || '',
        category_c: productData.category || '',
        price_c: parseFloat(productData.price) || 0,
        cost_price_c: parseFloat(productData.costPrice) || 0,
        stock_quantity_c: parseInt(productData.stockQuantity) || 0,
        min_stock_level_c: parseInt(productData.minStockLevel) || 0,
        barcode_c: productData.barcode || this.generateBarcode(),
        supplier_c: productData.supplier || '',
        description_c: productData.description || '',
        unit_c: productData.unit || ''
      }];

      const response = await this.apperClient.createRecord(this.tableName, { records });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMessage = result.message || "Failed to create product";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

const newProduct = result.data;
        const createdProduct = {
          Id: newProduct.Id,
          name: newProduct.name_c || newProduct.Name || '',
          category: newProduct.category_c || '',
          price: newProduct.price_c || 0,
          costPrice: newProduct.cost_price_c || 0,
          stockQuantity: newProduct.stock_quantity_c || 0,
          minStockLevel: newProduct.min_stock_level_c || 0,
          barcode: newProduct.barcode_c || '',
          supplier: newProduct.supplier_c || '',
          description: newProduct.description_c || '',
          unit: newProduct.unit_c || ''
        };

        // Call webhook Edge Function after successful product creation
        try {
          await this.apperClient.functions.invoke(import.meta.env.VITE_WEBHOOK, {
            body: JSON.stringify(createdProduct),
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (webhookError) {
          console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_WEBHOOK}. The error is: ${webhookError.message}`);
        }
        
        return createdProduct;
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async update(id, productData) {
    try {
      // Only include Updateable fields in update operation
      const records = [{
        Id: parseInt(id),
        Name: productData.name || '',
        name_c: productData.name || '',
        category_c: productData.category || '',
        price_c: parseFloat(productData.price) || 0,
        cost_price_c: parseFloat(productData.costPrice) || 0,
        stock_quantity_c: parseInt(productData.stockQuantity) || 0,
        min_stock_level_c: parseInt(productData.minStockLevel) || 0,
        barcode_c: productData.barcode || '',
        supplier_c: productData.supplier || '',
        description_c: productData.description || '',
        unit_c: productData.unit || ''
      }];

      const response = await this.apperClient.updateRecord(this.tableName, { records });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMessage = result.message || "Failed to update product";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

        const updatedProduct = result.data;
        return {
          Id: updatedProduct.Id,
          name: updatedProduct.name_c || updatedProduct.Name || '',
          category: updatedProduct.category_c || '',
          price: updatedProduct.price_c || 0,
          costPrice: updatedProduct.cost_price_c || 0,
          stockQuantity: updatedProduct.stock_quantity_c || 0,
          minStockLevel: updatedProduct.min_stock_level_c || 0,
          barcode: updatedProduct.barcode_c || '',
          supplier: updatedProduct.supplier_c || '',
          description: updatedProduct.description_c || '',
          unit: updatedProduct.unit_c || ''
        };
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await this.apperClient.deleteRecord(this.tableName, { 
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMessage = result.message || "Failed to delete product";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
        return { success: true };
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  async updateStock(id, newQuantity) {
    try {
      const currentProduct = await this.getById(id);
      return await this.update(id, {
        ...currentProduct,
        stockQuantity: newQuantity
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  }

  async getLowStockProducts() {
    try {
const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "cost_price_c"}},
          {"field": {"Name": "stock_quantity_c"}},
          {"field": {"Name": "min_stock_level_c"}},
          {"field": {"Name": "barcode_c"}},
          {"field": {"Name": "supplier_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "unit_c"}}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data
        .map(product => ({
          Id: product.Id,
          name: product.name_c || product.Name || '',
          category: product.category_c || '',
          price: product.price_c || 0,
          costPrice: product.cost_price_c || 0,
          stockQuantity: product.stock_quantity_c || 0,
          minStockLevel: product.min_stock_level_c || 0,
          barcode: product.barcode_c || '',
          supplier: product.supplier_c || '',
          description: product.description_c || '',
          unit: product.unit_c || ''
        }))
        .filter(product => product.stockQuantity <= product.minStockLevel);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      // Fallback to get all products and filter
      try {
        const allProducts = await this.getAll();
        return allProducts.filter(product => product.stockQuantity <= product.minStockLevel);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        throw error;
      }
    }
  }

  async getByCategory(category) {
    try {
      if (!category || category === "All") {
        return await this.getAll();
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "cost_price_c"}},
          {"field": {"Name": "stock_quantity_c"}},
          {"field": {"Name": "min_stock_level_c"}},
          {"field": {"Name": "barcode_c"}},
          {"field": {"Name": "supplier_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "unit_c"}}
        ],
        where: [{"FieldName": "category_c", "Operator": "ExactMatch", "Values": [category]}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(product => ({
        Id: product.Id,
        name: product.name_c || product.Name || '',
        category: product.category_c || '',
        price: product.price_c || 0,
        costPrice: product.cost_price_c || 0,
        stockQuantity: product.stock_quantity_c || 0,
        minStockLevel: product.min_stock_level_c || 0,
        barcode: product.barcode_c || '',
        supplier: product.supplier_c || '',
        description: product.description_c || '',
        unit: product.unit_c || ''
      }));
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      if (!query || query.trim() === "") {
        return await this.getAll();
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "cost_price_c"}},
          {"field": {"Name": "stock_quantity_c"}},
          {"field": {"Name": "min_stock_level_c"}},
          {"field": {"Name": "barcode_c"}},
          {"field": {"Name": "supplier_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "unit_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "name_c", "operator": "Contains", "values": [query]}
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {"fieldName": "category_c", "operator": "Contains", "values": [query]}
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {"fieldName": "description_c", "operator": "Contains", "values": [query]}
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {"fieldName": "barcode_c", "operator": "Contains", "values": [query]}
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {"fieldName": "supplier_c", "operator": "Contains", "values": [query]}
              ],
              "operator": "OR"
            }
          ]
        }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(product => ({
        Id: product.Id,
        name: product.name_c || product.Name || '',
        category: product.category_c || '',
        price: product.price_c || 0,
        costPrice: product.cost_price_c || 0,
        stockQuantity: product.stock_quantity_c || 0,
        minStockLevel: product.min_stock_level_c || 0,
        barcode: product.barcode_c || '',
        supplier: product.supplier_c || '',
        description: product.description_c || '',
        unit: product.unit_c || ''
      }));
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }

  generateBarcode() {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }
}

export default new ProductService();