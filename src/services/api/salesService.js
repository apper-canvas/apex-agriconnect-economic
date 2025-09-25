class SalesService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'sale_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "customer_id_c"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "discount_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "payment_method_c"}},
          {"field": {"Name": "payment_status_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        orderBy: [{"fieldName": "order_date_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to match UI expectations
      return response.data.map(sale => ({
        Id: sale.Id,
        customerId: sale.customer_id_c?.Id || sale.customer_id_c || '',
        customerName: sale.customer_name_c || '',
        items: sale.items_c ? JSON.parse(sale.items_c) : [],
        subtotal: sale.subtotal_c || 0,
        tax: sale.tax_c || 0,
        discount: sale.discount_c || 0,
        total: sale.total_c || 0,
        paymentMethod: sale.payment_method_c || '',
        paymentStatus: sale.payment_status_c || '',
        orderDate: sale.order_date_c || new Date().toISOString(),
        status: sale.status_c || '',
        notes: sale.notes_c || ''
      }));
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "customer_id_c"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "discount_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "payment_method_c"}},
          {"field": {"Name": "payment_status_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error("Sale not found");
      }

      const sale = response.data;
      return {
        Id: sale.Id,
        customerId: sale.customer_id_c?.Id || sale.customer_id_c || '',
        customerName: sale.customer_name_c || '',
        items: sale.items_c ? JSON.parse(sale.items_c) : [],
        subtotal: sale.subtotal_c || 0,
        tax: sale.tax_c || 0,
        discount: sale.discount_c || 0,
        total: sale.total_c || 0,
        paymentMethod: sale.payment_method_c || '',
        paymentStatus: sale.payment_status_c || '',
        orderDate: sale.order_date_c || new Date().toISOString(),
        status: sale.status_c || '',
        notes: sale.notes_c || ''
      };
    } catch (error) {
      console.error(`Error fetching sale ${id}:`, error);
      throw error;
    }
  }

  async create(saleData) {
    try {
      // Only include Updateable fields in create operation
      const records = [{
        Name: `Sale #${Date.now()}`,
        customer_id_c: parseInt(saleData.customerId) || null,
        customer_name_c: saleData.customerName || '',
        items_c: JSON.stringify(saleData.items || []),
        subtotal_c: parseFloat(saleData.subtotal) || 0,
        tax_c: parseFloat(saleData.tax) || 0,
        discount_c: parseFloat(saleData.discount) || 0,
        total_c: parseFloat(saleData.total) || 0,
        payment_method_c: saleData.paymentMethod || 'Cash',
        payment_status_c: saleData.paymentStatus || 'Paid',
        order_date_c: new Date().toISOString(),
        status_c: saleData.status || 'Completed',
        notes_c: saleData.notes || ''
      }];

      const response = await this.apperClient.createRecord(this.tableName, { records });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMessage = result.message || "Failed to create sale";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

        const newSale = result.data;
        return {
          Id: newSale.Id,
          customerId: newSale.customer_id_c?.Id || newSale.customer_id_c || '',
          customerName: newSale.customer_name_c || '',
          items: newSale.items_c ? JSON.parse(newSale.items_c) : [],
          subtotal: newSale.subtotal_c || 0,
          tax: newSale.tax_c || 0,
          discount: newSale.discount_c || 0,
          total: newSale.total_c || 0,
          paymentMethod: newSale.payment_method_c || '',
          paymentStatus: newSale.payment_status_c || '',
          orderDate: newSale.order_date_c || new Date().toISOString(),
          status: newSale.status_c || '',
          notes: newSale.notes_c || ''
        };
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error creating sale:", error);
      throw error;
    }
  }

  async update(id, saleData) {
    try {
      // Only include Updateable fields in update operation
      const records = [{
        Id: parseInt(id),
        Name: saleData.name || `Sale #${id}`,
        customer_id_c: parseInt(saleData.customerId) || null,
        customer_name_c: saleData.customerName || '',
        items_c: JSON.stringify(saleData.items || []),
        subtotal_c: parseFloat(saleData.subtotal) || 0,
        tax_c: parseFloat(saleData.tax) || 0,
        discount_c: parseFloat(saleData.discount) || 0,
        total_c: parseFloat(saleData.total) || 0,
        payment_method_c: saleData.paymentMethod || 'Cash',
        payment_status_c: saleData.paymentStatus || 'Paid',
        order_date_c: saleData.orderDate || new Date().toISOString(),
        status_c: saleData.status || 'Completed',
        notes_c: saleData.notes || ''
      }];

      const response = await this.apperClient.updateRecord(this.tableName, { records });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMessage = result.message || "Failed to update sale";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

        const updatedSale = result.data;
        return {
          Id: updatedSale.Id,
          customerId: updatedSale.customer_id_c?.Id || updatedSale.customer_id_c || '',
          customerName: updatedSale.customer_name_c || '',
          items: updatedSale.items_c ? JSON.parse(updatedSale.items_c) : [],
          subtotal: updatedSale.subtotal_c || 0,
          tax: updatedSale.tax_c || 0,
          discount: updatedSale.discount_c || 0,
          total: updatedSale.total_c || 0,
          paymentMethod: updatedSale.payment_method_c || '',
          paymentStatus: updatedSale.payment_status_c || '',
          orderDate: updatedSale.order_date_c || new Date().toISOString(),
          status: updatedSale.status_c || '',
          notes: updatedSale.notes_c || ''
        };
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error updating sale:", error);
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
          const errorMessage = result.message || "Failed to delete sale";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
        return { success: true };
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error deleting sale:", error);
      throw error;
    }
  }

  async getByCustomer(customerId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "customer_id_c"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "discount_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "payment_method_c"}},
          {"field": {"Name": "payment_status_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [{"FieldName": "customer_id_c", "Operator": "EqualTo", "Values": [parseInt(customerId)]}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(sale => ({
        Id: sale.Id,
        customerId: sale.customer_id_c?.Id || sale.customer_id_c || '',
        customerName: sale.customer_name_c || '',
        items: sale.items_c ? JSON.parse(sale.items_c) : [],
        subtotal: sale.subtotal_c || 0,
        tax: sale.tax_c || 0,
        discount: sale.discount_c || 0,
        total: sale.total_c || 0,
        paymentMethod: sale.payment_method_c || '',
        paymentStatus: sale.payment_status_c || '',
        orderDate: sale.order_date_c || new Date().toISOString(),
        status: sale.status_c || '',
        notes: sale.notes_c || ''
      }));
    } catch (error) {
      console.error("Error fetching sales by customer:", error);
      throw error;
    }
  }

  async getByDateRange(startDate, endDate) {
    try {
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate).toISOString();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "customer_id_c"}},
          {"field": {"Name": "customer_name_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "discount_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "payment_method_c"}},
          {"field": {"Name": "payment_status_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        whereGroups: [{
          "operator": "AND",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "order_date_c", "operator": "GreaterThanOrEqualTo", "values": [start]}
              ],
              "operator": "AND"
            },
            {
              "conditions": [
                {"fieldName": "order_date_c", "operator": "LessThanOrEqualTo", "values": [end]}
              ],
              "operator": "AND"
            }
          ]
        }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data.map(sale => ({
        Id: sale.Id,
        customerId: sale.customer_id_c?.Id || sale.customer_id_c || '',
        customerName: sale.customer_name_c || '',
        items: sale.items_c ? JSON.parse(sale.items_c) : [],
        subtotal: sale.subtotal_c || 0,
        tax: sale.tax_c || 0,
        discount: sale.discount_c || 0,
        total: sale.total_c || 0,
        paymentMethod: sale.payment_method_c || '',
        paymentStatus: sale.payment_status_c || '',
        orderDate: sale.order_date_c || new Date().toISOString(),
        status: sale.status_c || '',
        notes: sale.notes_c || ''
      }));
    } catch (error) {
      console.error("Error fetching sales by date range:", error);
      throw error;
    }
  }

  async getTodaysSales() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return await this.getByDateRange(today.toISOString(), tomorrow.toISOString());
    } catch (error) {
      console.error("Error fetching today's sales:", error);
      throw error;
    }
  }

  async getSalesMetrics() {
    try {
      const sales = await this.getAll();
      
      const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
      const totalOrders = sales.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      const paidSales = sales.filter(sale => sale.paymentStatus === "Paid");
      const paidAmount = paidSales.reduce((sum, sale) => sum + sale.total, 0);
      
      const pendingSales = sales.filter(sale => sale.paymentStatus === "Pending");
      const pendingAmount = pendingSales.reduce((sum, sale) => sum + sale.total, 0);

      return {
        totalSales,
        totalOrders,
        averageOrderValue,
        paidAmount,
        pendingAmount,
        paidOrders: paidSales.length,
        pendingOrders: pendingSales.length
      };
    } catch (error) {
      console.error("Error calculating sales metrics:", error);
      throw error;
    }
  }

  async updatePaymentStatus(id, paymentStatus) {
    try {
      const currentSale = await this.getById(id);
      const updatedSale = {
        ...currentSale,
        paymentStatus,
        status: paymentStatus === "Paid" ? "Completed" : currentSale.status
      };
      
      return await this.update(id, updatedSale);
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  }
}

export default new SalesService();