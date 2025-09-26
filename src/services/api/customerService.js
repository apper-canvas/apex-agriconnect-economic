class CustomerService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'customer_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "farm_size_c"}},
          {"field": {"Name": "crop_types_c"}},
          {"field": {"Name": "loyalty_points_c"}},
          {"field": {"Name": "total_purchases_c"}},
          {"field": {"Name": "last_visit_c"}},
          {"field": {"Name": "communication_log_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to match UI expectations
      return response.data.map(customer => ({
        Id: customer.Id,
        name: customer.name_c || customer.Name || '',
        phone: customer.phone_c || '',
        email: customer.email_c || '',
        address: customer.address_c || '',
        farmSize: customer.farm_size_c || '',
        cropTypes: customer.crop_types_c ? customer.crop_types_c.split(',').map(c => c.trim()).filter(c => c) : [],
        loyaltyPoints: customer.loyalty_points_c || 0,
        totalPurchases: customer.total_purchases_c || 0.00,
        lastVisit: customer.last_visit_c || null,
        communicationLog: customer.communication_log_c ? 
          JSON.parse(customer.communication_log_c).map(log => ({
            ...log,
            date: log.date || new Date().toISOString()
          })) : []
      }));
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "farm_size_c"}},
          {"field": {"Name": "crop_types_c"}},
          {"field": {"Name": "loyalty_points_c"}},
          {"field": {"Name": "total_purchases_c"}},
          {"field": {"Name": "last_visit_c"}},
          {"field": {"Name": "communication_log_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error("Customer not found");
      }

      const customer = response.data;
      return {
        Id: customer.Id,
        name: customer.name_c || customer.Name || '',
        phone: customer.phone_c || '',
        email: customer.email_c || '',
        address: customer.address_c || '',
        farmSize: customer.farm_size_c || '',
        cropTypes: customer.crop_types_c ? customer.crop_types_c.split(',').map(c => c.trim()).filter(c => c) : [],
        loyaltyPoints: customer.loyalty_points_c || 0,
        totalPurchases: customer.total_purchases_c || 0.00,
        lastVisit: customer.last_visit_c || null,
        communicationLog: customer.communication_log_c ? 
          JSON.parse(customer.communication_log_c).map(log => ({
            ...log,
            date: log.date || new Date().toISOString()
          })) : []
      };
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  }

async create(customerData) {
    try {
      // Only include Updateable fields in create operation
      const records = [{
        Name: customerData.name || '',
        name_c: customerData.name || '',
        phone_c: customerData.phone || '',
        email_c: customerData.email || '',
        address_c: customerData.address || '',
        farm_size_c: customerData.farmSize || '',
        crop_types_c: Array.isArray(customerData.cropTypes) ? customerData.cropTypes.join(', ') : '',
        loyalty_points_c: 0,
        total_purchases_c: 0.00,
        last_visit_c: new Date().toISOString(),
        communication_log_c: JSON.stringify([])
      }];

      const response = await this.apperClient.createRecord(this.tableName, { records });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMessage = result.message || "Failed to create customer";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

        const newCustomer = result.data;
        const customerResult = {
          Id: newCustomer.Id,
          name: newCustomer.name_c || newCustomer.Name || '',
          phone: newCustomer.phone_c || '',
          email: newCustomer.email_c || '',
          address: newCustomer.address_c || '',
          farmSize: newCustomer.farm_size_c || '',
          cropTypes: newCustomer.crop_types_c ? newCustomer.crop_types_c.split(',').map(c => c.trim()).filter(c => c) : [],
          loyaltyPoints: newCustomer.loyalty_points_c || 0,
          totalPurchases: newCustomer.total_purchases_c || 0.00,
          lastVisit: newCustomer.last_visit_c || null,
communicationLog: []
      };

try {
          // Send welcome email via Edge function
          const { ApperClient } = window.ApperSDK;
          const emailResponse = await ApperClient.functions.invoke(import.meta.env.VITE_SEND_CUSTOMER_WELCOME_EMAIL, {
            body: customerResult,
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (emailResponse.ok) {
            const emailResult = await emailResponse.json();
            // Add email status to customer result for UI feedback
            customerResult.emailStatus = emailResult.success ? 'sent' : 'failed';
            customerResult.emailMessage = emailResult.message;
          } else {
            customerResult.emailStatus = 'failed';
            customerResult.emailMessage = 'Failed to send welcome email';
          }
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't throw error - customer creation should still succeed
          customerResult.emailStatus = 'failed';
          customerResult.emailMessage = 'Failed to send welcome email';
        }

        // Send welcome SMS via Edge function
        try {
          const { ApperClient } = window.ApperSDK;
          const smsResponse = await ApperClient.functions.invoke(import.meta.env.VITE_SEND_CUSTOMER_WELCOME_SMS, {
            body: customerResult,
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (smsResponse.ok) {
            const smsResult = await smsResponse.json();
            // Add SMS status to customer result for UI feedback
            customerResult.smsStatus = smsResult.smsStatus || (smsResult.success ? 'sent' : 'failed');
            customerResult.smsMessage = smsResult.smsMessage || smsResult.message;
          } else {
            customerResult.smsStatus = 'failed';
            customerResult.smsMessage = 'Failed to send welcome SMS';
          }
        } catch (smsError) {
          console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_SEND_CUSTOMER_WELCOME_SMS}. The error is: ${smsError.message}`);
          // Don't throw error - customer creation should still succeed
          customerResult.smsStatus = 'failed';
          customerResult.smsMessage = 'Failed to send welcome SMS';
        }

        return customerResult;
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  async update(id, customerData) {
    try {
      // Only include Updateable fields in update operation
      const records = [{
        Id: parseInt(id),
        Name: customerData.name || '',
        name_c: customerData.name || '',
        phone_c: customerData.phone || '',
        email_c: customerData.email || '',
        address_c: customerData.address || '',
        farm_size_c: customerData.farmSize || '',
        crop_types_c: Array.isArray(customerData.cropTypes) ? customerData.cropTypes.join(', ') : customerData.cropTypes || '',
        loyalty_points_c: customerData.loyaltyPoints || 0,
        total_purchases_c: customerData.totalPurchases || 0.00,
        last_visit_c: customerData.lastVisit || new Date().toISOString(),
        communication_log_c: Array.isArray(customerData.communicationLog) ? JSON.stringify(customerData.communicationLog) : customerData.communicationLog || JSON.stringify([])
      }];

      const response = await this.apperClient.updateRecord(this.tableName, { records });

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          const errorMessage = result.message || "Failed to update customer";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }

        const updatedCustomer = result.data;
        return {
          Id: updatedCustomer.Id,
          name: updatedCustomer.name_c || updatedCustomer.Name || '',
          phone: updatedCustomer.phone_c || '',
          email: updatedCustomer.email_c || '',
          address: updatedCustomer.address_c || '',
          farmSize: updatedCustomer.farm_size_c || '',
          cropTypes: updatedCustomer.crop_types_c ? updatedCustomer.crop_types_c.split(',').map(c => c.trim()).filter(c => c) : [],
          loyaltyPoints: updatedCustomer.loyalty_points_c || 0,
          totalPurchases: updatedCustomer.total_purchases_c || 0.00,
          lastVisit: updatedCustomer.last_visit_c || null,
          communicationLog: updatedCustomer.communication_log_c ? JSON.parse(updatedCustomer.communication_log_c) : []
        };
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error updating customer:", error);
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
          const errorMessage = result.message || "Failed to delete customer";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
        return { success: true };
      }

      throw new Error("No response data received");
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }

  async addCommunication(id, communication) {
    try {
      // First get the current customer to update their communication log
      const currentCustomer = await this.getById(id);
      
      const newCommunication = {
        ...communication,
        date: new Date().toISOString()
      };

      const updatedCommunicationLog = [newCommunication, ...currentCustomer.communicationLog];
      
      // Update the customer with the new communication log
      const updatedCustomer = await this.update(id, {
        ...currentCustomer,
        communicationLog: updatedCommunicationLog,
        lastVisit: new Date().toISOString()
      });

      return updatedCustomer;
    } catch (error) {
      console.error("Error adding communication:", error);
      throw error;
    }
  }

  async searchCustomers(query) {
    try {
      if (!query || query.trim() === "") {
        return await this.getAll();
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "farm_size_c"}},
          {"field": {"Name": "crop_types_c"}},
          {"field": {"Name": "loyalty_points_c"}},
          {"field": {"Name": "total_purchases_c"}},
          {"field": {"Name": "last_visit_c"}},
          {"field": {"Name": "communication_log_c"}}
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
                {"fieldName": "phone_c", "operator": "Contains", "values": [query]}
              ],
              "operator": "OR"  
            },
            {
              "conditions": [
                {"fieldName": "email_c", "operator": "Contains", "values": [query]}
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

      return response.data.map(customer => ({
        Id: customer.Id,
        name: customer.name_c || customer.Name || '',
        phone: customer.phone_c || '',
        email: customer.email_c || '',
        address: customer.address_c || '',
        farmSize: customer.farm_size_c || '',
        cropTypes: customer.crop_types_c ? customer.crop_types_c.split(',').map(c => c.trim()).filter(c => c) : [],
        loyaltyPoints: customer.loyalty_points_c || 0,
        totalPurchases: customer.total_purchases_c || 0.00,
        lastVisit: customer.last_visit_c || null,
        communicationLog: customer.communication_log_c ? JSON.parse(customer.communication_log_c) : []
      }));
    } catch (error) {
      console.error("Error searching customers:", error);
      throw error;
    }
  }
}

export default new CustomerService();