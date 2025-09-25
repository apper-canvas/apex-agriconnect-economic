import productsData from "@/services/mockData/products.json";

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ProductService {
  constructor() {
    this.products = [...productsData];
  }

  async getAll() {
    await delay(300);
    return [...this.products];
  }

  async getById(id) {
    await delay(200);
    const product = this.products.find(p => p.Id === parseInt(id));
    if (!product) {
      throw new Error("Product not found");
    }
    return { ...product };
  }

  async create(productData) {
    await delay(400);
    const maxId = Math.max(...this.products.map(p => p.Id), 0);
    const newProduct = {
      ...productData,
      Id: maxId + 1,
      barcode: this.generateBarcode()
    };
    this.products.push(newProduct);
    return { ...newProduct };
  }

  async update(id, productData) {
    await delay(350);
    const index = this.products.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Product not found");
    }
    this.products[index] = { ...this.products[index], ...productData };
    return { ...this.products[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.products.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Product not found");
    }
    const deleted = this.products.splice(index, 1)[0];
    return { ...deleted };
  }

  async updateStock(id, newQuantity) {
    await delay(200);
    const product = this.products.find(p => p.Id === parseInt(id));
    if (!product) {
      throw new Error("Product not found");
    }
    product.stockQuantity = newQuantity;
    return { ...product };
  }

  async getLowStockProducts() {
    await delay(250);
    return this.products.filter(product => 
      product.stockQuantity <= product.minStockLevel
    ).map(product => ({ ...product }));
  }

  async getByCategory(category) {
    await delay(300);
    if (!category || category === "All") {
      return [...this.products];
    }
    return this.products
      .filter(product => product.category === category)
      .map(product => ({ ...product }));
  }

  async searchProducts(query) {
    await delay(250);
    if (!query || query.trim() === "") {
      return [...this.products];
    }
    
    const searchTerm = query.toLowerCase().trim();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.barcode.includes(searchTerm) ||
      product.supplier.toLowerCase().includes(searchTerm)
    );
  }

  generateBarcode() {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }
}

export default new ProductService();