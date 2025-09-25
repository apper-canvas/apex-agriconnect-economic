import salesData from "@/services/mockData/sales.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SalesService {
  constructor() {
    this.sales = [...salesData];
  }

  async getAll() {
    await delay(300);
    return [...this.sales];
  }

  async getById(id) {
    await delay(200);
    const sale = this.sales.find(s => s.Id === parseInt(id));
    if (!sale) {
      throw new Error("Sale not found");
    }
    return { ...sale };
  }

  async create(saleData) {
    await delay(400);
    const maxId = Math.max(...this.sales.map(s => s.Id), 0);
    const newSale = {
      ...saleData,
      Id: maxId + 1,
      orderDate: new Date().toISOString(),
      status: saleData.status || "Processing"
    };
    this.sales.push(newSale);
    return { ...newSale };
  }

  async update(id, saleData) {
    await delay(350);
    const index = this.sales.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Sale not found");
    }
    this.sales[index] = { ...this.sales[index], ...saleData };
    return { ...this.sales[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.sales.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Sale not found");
    }
    const deleted = this.sales.splice(index, 1)[0];
    return { ...deleted };
  }

  async getByCustomer(customerId) {
    await delay(250);
    return this.sales
      .filter(sale => sale.customerId === customerId.toString())
      .map(sale => ({ ...sale }));
  }

  async getByDateRange(startDate, endDate) {
    await delay(300);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.sales.filter(sale => {
      const saleDate = new Date(sale.orderDate);
      return saleDate >= start && saleDate <= end;
    }).map(sale => ({ ...sale }));
  }

  async getTodaysSales() {
    await delay(250);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.sales.filter(sale => {
      const saleDate = new Date(sale.orderDate);
      return saleDate >= today && saleDate < tomorrow;
    }).map(sale => ({ ...sale }));
  }

  async getSalesMetrics() {
    await delay(300);
    const totalSales = this.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = this.sales.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    const paidSales = this.sales.filter(sale => sale.paymentStatus === "Paid");
    const paidAmount = paidSales.reduce((sum, sale) => sum + sale.total, 0);
    
    const pendingSales = this.sales.filter(sale => sale.paymentStatus === "Pending");
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
  }

  async updatePaymentStatus(id, paymentStatus) {
    await delay(200);
    const sale = this.sales.find(s => s.Id === parseInt(id));
    if (!sale) {
      throw new Error("Sale not found");
    }
    sale.paymentStatus = paymentStatus;
    if (paymentStatus === "Paid") {
      sale.status = "Completed";
    }
    return { ...sale };
  }
}

export default new SalesService();