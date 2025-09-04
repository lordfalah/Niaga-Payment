import { PrismaClient } from "../src/generated/prisma";
const prisma = new PrismaClient();
async function main() {
  console.log("🌱 Start seeding...");

  // Hapus data lama
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Data kategori manual
  const categories = [
    { name: "Makanan", description: "Kategori berbagai jenis makanan." },
    { name: "Minuman", description: "Kategori berbagai jenis minuman." },
    { name: "Snack", description: "Kategori berbagai jenis camilan." },
  ];

  // Insert kategori
  const createdCategories = await Promise.all(
    categories.map((cat) =>
      prisma.category.create({
        data: cat,
      }),
    ),
  );

  // Buat produk manual
  const products = [
    {
      name: "Nasi Goreng Spesial",
      description: "Nasi goreng dengan telur, ayam, dan sayuran.",
      price: 25000,
      category: "Makanan",
    },
    {
      name: "Ayam Bakar Madu",
      description: "Ayam bakar dengan bumbu madu manis gurih.",
      price: 30000,
      category: "Makanan",
    },
    {
      name: "Es Teh Manis",
      description: "Minuman teh segar dengan gula.",
      price: 8000,
      category: "Minuman",
    },
    {
      name: "Kopi Hitam",
      description: "Kopi hitam tanpa gula, rasa pahit khas.",
      price: 12000,
      category: "Minuman",
    },
    {
      name: "Keripik Singkong",
      description: "Camilan gurih renyah dari singkong.",
      price: 10000,
      category: "Snack",
    },
    {
      name: "Cokelat Bar",
      description: "Cokelat batang manis nikmat.",
      price: 15000,
      category: "Snack",
    },
  ];

  // Insert produk, cari kategori berdasarkan nama
  for (const product of products) {
    const category = createdCategories.find((c) => c.name === product.category);
    if (!category) continue;

    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: category.id,
      },
    });
  }

  console.log("✅ Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
