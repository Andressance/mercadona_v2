import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "../src/services/firebase.js";

const productos = [
  { nombre: "Fresas", precio: 3.5, categoria: "Frutas", descripcion: "Fresas frescas y dulces", stock: 50 },
  { nombre: "Leche de Almendra", precio: 2.8, categoria: "Bebidas", descripcion: "Leche vegetal de almendra", stock: 30 },
  { nombre: "Pan Integral", precio: 1.5, categoria: "Panadería", descripcion: "Pan 100% integral", stock: 40 },
  { nombre: "Yogur Natural", precio: 0.9, categoria: "Lácteos", descripcion: "Yogur sin azúcar añadido", stock: 60 },
  { nombre: "Aceite de Oliva", precio: 5.2, categoria: "Aceites", descripcion: "Aceite de oliva virgen extra", stock: 25 },
  { nombre: "Huevos Camperos", precio: 3.0, categoria: "Huevos", descripcion: "Huevos de gallinas camperas", stock: 70 },
  { nombre: "Tomate Cherry", precio: 2.5, categoria: "Verduras", descripcion: "Tomates cherry frescos", stock: 45 },
  { nombre: "Queso Manchego", precio: 4.5, categoria: "Lácteos", descripcion: "Queso manchego curado", stock: 20 },
  { nombre: "Agua Mineral", precio: 0.5, categoria: "Bebidas", descripcion: "Agua mineral natural", stock: 100 },
  { nombre: "Chocolate Negro 70%", precio: 2.3, categoria: "Dulces", descripcion: "Chocolate con 70% cacao", stock: 35 },
  { nombre: "Plátanos", precio: 2.0, categoria: "Frutas", descripcion: "Plátanos maduros", stock: 60 },
  { nombre: "Leche Desnatada", precio: 1.2, categoria: "Lácteos", descripcion: "Leche baja en grasa", stock: 50 },
  { nombre: "Pan de Molde Integral", precio: 1.8, categoria: "Panadería", descripcion: "Pan de molde integral", stock: 40 },
  { nombre: "Mantequilla", precio: 2.5, categoria: "Lácteos", descripcion: "Mantequilla sin sal", stock: 30 },
  { nombre: "Arroz Integral", precio: 2.2, categoria: "Cereales", descripcion: "Arroz integral ecológico", stock: 50 },
  { nombre: "Pasta Espagueti", precio: 1.7, categoria: "Cereales", descripcion: "Pasta de trigo duro", stock: 60 },
  { nombre: "Manzanas", precio: 2.5, categoria: "Frutas", descripcion: "Manzanas rojas frescas", stock: 70 },
  { nombre: "Zumo de Naranja", precio: 3.0, categoria: "Bebidas", descripcion: "Zumo natural exprimido", stock: 40 },
  { nombre: "Galletas Integrales", precio: 1.9, categoria: "Dulces", descripcion: "Galletas saludables", stock: 55 },
  { nombre: "Harina de Trigo", precio: 1.2, categoria: "Cereales", descripcion: "Harina de trigo para repostería", stock: 60 },
  { nombre: "Lechuga", precio: 1.0, categoria: "Verduras", descripcion: "Lechuga fresca", stock: 50 },
  { nombre: "Pepino", precio: 0.8, categoria: "Verduras", descripcion: "Pepino fresco", stock: 45 },
  { nombre: "Pollo Entero", precio: 7.5, categoria: "Carnes", descripcion: "Pollo de corral", stock: 25 },
  { nombre: "Carne Picada de Ternera", precio: 6.5, categoria: "Carnes", descripcion: "Carne picada fresca", stock: 30 },
  { nombre: "Salmón Fresco", precio: 12.0, categoria: "Pescados", descripcion: "Salmón fresco de calidad", stock: 20 },
  { nombre: "Atún en Lata", precio: 1.8, categoria: "Pescados", descripcion: "Atún en aceite de oliva", stock: 50 },
  { nombre: "Cereal de Avena", precio: 3.0, categoria: "Cereales", descripcion: "Cereal de avena integral", stock: 40 },
  { nombre: "Miel", precio: 4.5, categoria: "Dulces", descripcion: "Miel natural", stock: 25 },
  { nombre: "Tomate Natural Triturado", precio: 1.2, categoria: "Conservas", descripcion: "Tomate triturado en lata", stock: 60 },
  { nombre: "Cebolla", precio: 1.0, categoria: "Verduras", descripcion: "Cebolla fresca", stock: 50 },
  { nombre: "Ajo", precio: 0.5, categoria: "Verduras", descripcion: "Ajo fresco", stock: 45 },
  { nombre: "Leche de Soja", precio: 2.6, categoria: "Bebidas", descripcion: "Leche vegetal de soja", stock: 30 },
  { nombre: "Queso Gouda", precio: 4.0, categoria: "Lácteos", descripcion: "Queso gouda suave", stock: 25 },
  { nombre: "Yogur Griego", precio: 1.2, categoria: "Lácteos", descripcion: "Yogur griego natural", stock: 40 },
  { nombre: "Bebida Energética", precio: 2.0, categoria: "Bebidas", descripcion: "Bebida energética con cafeína", stock: 35 },
  { nombre: "Chocolate con Leche", precio: 2.0, categoria: "Dulces", descripcion: "Chocolate con leche", stock: 50 },
  { nombre: "Galletas de Chocolate", precio: 2.5, categoria: "Dulces", descripcion: "Galletas rellenas de chocolate", stock: 45 },
  { nombre: "Aceitunas Verdes", precio: 1.5, categoria: "Conservas", descripcion: "Aceitunas en salmuera", stock: 40 },
  { nombre: "Pimientos Rojos", precio: 2.0, categoria: "Verduras", descripcion: "Pimientos frescos", stock: 50 },
  { nombre: "Zanahorias", precio: 1.2, categoria: "Verduras", descripcion: "Zanahorias frescas", stock: 60 },
  { nombre: "Patatas", precio: 1.5, categoria: "Verduras", descripcion: "Patatas para cocinar", stock: 70 },
  { nombre: "Café Molido", precio: 3.5, categoria: "Bebidas", descripcion: "Café tostado y molido", stock: 40 },
  { nombre: "Té Verde", precio: 2.0, categoria: "Bebidas", descripcion: "Té verde natural", stock: 50 },
  { nombre: "Jamón Serrano", precio: 8.5, categoria: "Carnes", descripcion: "Jamón curado de calidad", stock: 15 },
  { nombre: "Chorizo", precio: 5.0, categoria: "Carnes", descripcion: "Chorizo ibérico", stock: 20 },
  { nombre: "Leche Entera", precio: 1.3, categoria: "Lácteos", descripcion: "Leche fresca entera", stock: 50 },
  { nombre: "Pan Baguette", precio: 1.2, categoria: "Panadería", descripcion: "Baguette francesa", stock: 40 },
  { nombre: "Mermelada de Fresa", precio: 2.8, categoria: "Dulces", descripcion: "Mermelada 100% natural", stock: 30 },
  { nombre: "Galletas Saladas", precio: 1.8, categoria: "Dulces", descripcion: "Galletas saladas crujientes", stock: 50 },
  { nombre: "Pasta Fusilli", precio: 1.7, categoria: "Cereales", descripcion: "Pasta de trigo duro", stock: 60 },
  { nombre: "Arroz Basmati", precio: 3.0, categoria: "Cereales", descripcion: "Arroz aromático Basmati", stock: 40 },
  { nombre: "Aceite de Girasol", precio: 3.2, categoria: "Aceites", descripcion: "Aceite de girasol puro", stock: 25 },
  { nombre: "Vinagre de Manzana", precio: 2.0, categoria: "Aceites", descripcion: "Vinagre natural de manzana", stock: 30 },
];


async function populateProductos() {
  console.log(`Empezando a subir ${productos.length} productos a Firestore...`);

  const batch = writeBatch(db);
  
  productos.forEach((producto, index) => {
    const productRef = doc(db, "producto", `prod${index + 1}`);
    batch.set(productRef, producto);
  });

  await batch.commit();
  console.log("✅ Todos los productos han sido subidos a Firestore");
}

populateProductos().catch(err => console.error(err));