class SupplierService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'supplier_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "products_c"}},
          {"field": {"Name": "payment_terms_c"}},
          {"field": {"Name": "last_delivery_c"}},
          {"field": {"Name": "reliability_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to match UI expectations
      return response.data.map(supplier => ({
        Id: supplier.Id,
        name: supplier.name_c || supplier.Name || '',
        contact: supplier.contact_c || '',
        address: supplier.address_c || '',
        products: supplier.products_c ? supplier.products_c.split(',').map(p => p.trim()).filter(p => p) : [],
        paymentTerms: supplier.payment_terms_c || 'Net 30',
        lastDelivery: supplier.last_delivery_c || null,
        reliability: supplier.reliability_c || 85
      }));
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "products_c"}},
          {"field": {"Name": "payment_terms_c"}},
          {"field": {"Name": "last_delivery_c"}},
          {"field": {"Name": "reliability_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error("Supplier not found");
      }

      const supplier = response.data;
      return {
        Id: supplier.Id,
        name: supplier.name_c || supplier.Name || '',
        contact: supplier.contact_c || '',
        address: supplier.address_c || '',
        products: supplier.products_c ? supplier.products_c.split(',').map(p => p.trim()).filter(p => p) : [],
        paymentTerms: supplier.payment_terms_c || 'Net 30',
        lastDelivery: supplier.last_delivery_c || null,
        reliability: supplier.reliability_c || 85
      };
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw error;
    }
  }

  async create(supplierData) {
    try {
      // Only include Updateable fields in create operation
      const records = [{
        Name: supplierData.name || '',
        name_c: supplierData.name || '',
        contact_c: supplierData.contact || '',
        address_c: supplierData.address || '',
        products_c: Array.isArray(supplierData.products) ? supplierData.products.join(', ') : '',
        payment_terms_c: supplierData.paymentTerms || 'Net 30',
        last_delivery_c: null,
        reliability_c: 85
      }];

      const response = await this.apperClient.createRecord(this.tableName, { records });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMessage = result.message || "Failed to create supplier";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

        const newSupplier = result.data;
        return {
          Id: newSupplier.Id,
          name: newSupplier.name_c || newSupplier.Name || '',
          contact: newSupplier.contact_c || '',
          address: newSupplier.address_c || '',
          products: newSupplier.products_c ? newSupplier.products_c.split(',').map(p => p.trim()).filter(p => p) : [],
          paymentTerms: newSupplier.payment_terms_c || 'Net 30',
          lastDelivery: newSupplier.last_delivery_c || null,
          reliability: newSupplier.reliability_c || 85
        };
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  }

  async update(id, supplierData) {
    try {
      // Only include Updateable fields in update operation
      const records = [{
        Id: parseInt(id),
        Name: supplierData.name || '',
        name_c: supplierData.name || '',
        contact_c: supplierData.contact || '',
        address_c: supplierData.address || '',
        products_c: Array.isArray(supplierData.products) ? supplierData.products.join(', ') : supplierData.products || '',
        payment_terms_c: supplierData.paymentTerms || 'Net 30',
        last_delivery_c: supplierData.lastDelivery || null,
        reliability_c: supplierData.reliability || 85
      }];

      const response = await this.apperClient.updateRecord(this.tableName, { records });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMessage = result.message || "Failed to update supplier";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

        const updatedSupplier = result.data;
        return {
          Id: updatedSupplier.Id,
          name: updatedSupplier.name_c || updatedSupplier.Name || '',
          contact: updatedSupplier.contact_c || '',
          address: updatedSupplier.address_c || '',
          products: updatedSupplier.products_c ? updatedSupplier.products_c.split(',').map(p => p.trim()).filter(p => p) : [],
          paymentTerms: updatedSupplier.payment_terms_c || 'Net 30',
          lastDelivery: updatedSupplier.last_delivery_c || null,
          reliability: updatedSupplier.reliability_c || 85
        };
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error updating supplier:", error);
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
          const errorMessage = result.message || "Failed to delete supplier";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
        return { success: true };
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw error;
    }
  }

  async updateDeliveryDate(id, deliveryDate) {
    try {
      const currentSupplier = await this.getById(id);
      return await this.update(id, {
        ...currentSupplier,
        lastDelivery: deliveryDate
      });
    } catch (error) {
      console.error("Error updating delivery date:", error);
      throw error;
    }
  }

  async updateReliabilityScore(id, score) {
    try {
      const currentSupplier = await this.getById(id);
      const clampedScore = Math.max(0, Math.min(100, score));
      return await this.update(id, {
        ...currentSupplier,
        reliability: clampedScore
      });
    } catch (error) {
      console.error("Error updating reliability score:", error);
      throw error;
    }
  }

  async searchSuppliers(query) {
    try {
      if (!query || query.trim() === "") {
        return await this.getAll();
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "contact_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "products_c"}},
          {"field": {"Name": "payment_terms_c"}},
          {"field": {"Name": "last_delivery_c"}},
          {"field": {"Name": "reliability_c"}}
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
                {"fieldName": "contact_c", "operator": "Contains", "values": [query]}
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {"fieldName": "address_c", "operator": "Contains", "values": [query]}
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

      return response.data.map(supplier => ({
        Id: supplier.Id,
        name: supplier.name_c || supplier.Name || '',
        contact: supplier.contact_c || '',
        address: supplier.address_c || '',
        products: supplier.products_c ? supplier.products_c.split(',').map(p => p.trim()).filter(p => p) : [],
        paymentTerms: supplier.payment_terms_c || 'Net 30',
        lastDelivery: supplier.last_delivery_c || null,
        reliability: supplier.reliability_c || 85
      }));
    } catch (error) {
      console.error("Error searching suppliers:", error);
      throw error;
    }
  }

  async getReliabilityReport() {
    try {
      const suppliers = await this.getAll();
      const reliable = suppliers.filter(s => s.reliability >= 90).length;
      const good = suppliers.filter(s => s.reliability >= 80 && s.reliability < 90).length;
      const average = suppliers.filter(s => s.reliability >= 70 && s.reliability < 80).length;
      const poor = suppliers.filter(s => s.reliability < 70).length;

      return { reliable, good, average, poor, total: suppliers.length };
    } catch (error) {
      console.error("Error generating reliability report:", error);
      throw error;
    }
  }
}

export default new SupplierService();