import customersData from "@/services/mockData/customers.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CustomerService {
  constructor() {
    this.customers = [...customersData];
  }

  async getAll() {
    await delay(300);
    return [...this.customers];
  }

  async getById(id) {
    await delay(200);
    const customer = this.customers.find(c => c.Id === parseInt(id));
    if (!customer) {
      throw new Error("Customer not found");
    }
    return { ...customer };
  }

  async create(customerData) {
    await delay(400);
    const maxId = Math.max(...this.customers.map(c => c.Id), 0);
    const newCustomer = {
      ...customerData,
      Id: maxId + 1,
      loyaltyPoints: 0,
      totalPurchases: 0.00,
      lastVisit: new Date().toISOString(),
      communicationLog: []
    };
    this.customers.push(newCustomer);
    return { ...newCustomer };
  }

  async update(id, customerData) {
    await delay(350);
    const index = this.customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Customer not found");
    }
    this.customers[index] = { ...this.customers[index], ...customerData };
    return { ...this.customers[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Customer not found");
    }
    const deleted = this.customers.splice(index, 1)[0];
    return { ...deleted };
  }

  async addCommunication(id, communication) {
    await delay(200);
    const customer = this.customers.find(c => c.Id === parseInt(id));
    if (!customer) {
      throw new Error("Customer not found");
    }
    const newCommunication = {
      ...communication,
      date: new Date().toISOString()
    };
    customer.communicationLog.unshift(newCommunication);
    return { ...customer };
  }

  async searchCustomers(query) {
    await delay(250);
    if (!query || query.trim() === "") {
      return [...this.customers];
    }
    
    const searchTerm = query.toLowerCase().trim();
    return this.customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm) ||
      customer.cropTypes.some(crop => crop.toLowerCase().includes(searchTerm))
    );
  }
}

export default new CustomerService();