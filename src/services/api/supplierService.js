import suppliersData from "@/services/mockData/suppliers.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SupplierService {
  constructor() {
    this.suppliers = [...suppliersData];
  }

  async getAll() {
    await delay(300);
    return [...this.suppliers];
  }

  async getById(id) {
    await delay(200);
    const supplier = this.suppliers.find(s => s.Id === parseInt(id));
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    return { ...supplier };
  }

  async create(supplierData) {
    await delay(400);
    const maxId = Math.max(...this.suppliers.map(s => s.Id), 0);
    const newSupplier = {
      ...supplierData,
      Id: maxId + 1,
      lastDelivery: null,
      reliability: 85
    };
    this.suppliers.push(newSupplier);
    return { ...newSupplier };
  }

  async update(id, supplierData) {
    await delay(350);
    const index = this.suppliers.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Supplier not found");
    }
    this.suppliers[index] = { ...this.suppliers[index], ...supplierData };
    return { ...this.suppliers[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.suppliers.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Supplier not found");
    }
    const deleted = this.suppliers.splice(index, 1)[0];
    return { ...deleted };
  }

  async updateDeliveryDate(id, deliveryDate) {
    await delay(200);
    const supplier = this.suppliers.find(s => s.Id === parseInt(id));
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    supplier.lastDelivery = deliveryDate;
    return { ...supplier };
  }

  async updateReliabilityScore(id, score) {
    await delay(200);
    const supplier = this.suppliers.find(s => s.Id === parseInt(id));
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    supplier.reliability = Math.max(0, Math.min(100, score));
    return { ...supplier };
  }

  async searchSuppliers(query) {
    await delay(250);
    if (!query || query.trim() === "") {
      return [...this.suppliers];
    }
    
    const searchTerm = query.toLowerCase().trim();
    return this.suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm) ||
      supplier.contact.includes(searchTerm) ||
      supplier.address.toLowerCase().includes(searchTerm) ||
      supplier.products.some(product => product.toLowerCase().includes(searchTerm))
    );
  }

  async getReliabilityReport() {
    await delay(300);
    const reliable = this.suppliers.filter(s => s.reliability >= 90).length;
    const good = this.suppliers.filter(s => s.reliability >= 80 && s.reliability < 90).length;
    const average = this.suppliers.filter(s => s.reliability >= 70 && s.reliability < 80).length;
    const poor = this.suppliers.filter(s => s.reliability < 70).length;

    return { reliable, good, average, poor, total: this.suppliers.length };
  }
}

export default new SupplierService();