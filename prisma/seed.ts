import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma = globalForPrisma.prisma || new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // Hapus data lama
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Data kategori manual
  const categories = [
    { name: "Makanan", description: "Kategori berbagai jenis makanan." },
    { name: "Minuman", description: "Kategori berbagai jenis minuman." },
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
      name: "Sate Ayam",
      description:
        "Tusukan daging ayam panggang disajikan dengan bumbu kacang.",
      price: 22000,
      category: "Makanan",
    },
    {
      name: "Gado-gado",
      description: "Campuran sayuran segar dengan lontong dan saus kacang.",
      price: 18000,
      category: "Makanan",
    },
    {
      name: "Rendang",
      description:
        "Daging sapi yang dimasak perlahan dalam santan dan rempah-rempah.",
      price: 35000,
      category: "Makanan",
    },
    {
      name: "Es Teh Manis",
      description: "Minuman teh segar dengan gula.",
      price: 8000,
      category: "Minuman",
    },
    {
      name: "Jus Jeruk",
      description: "Minuman jus segar dari buah jeruk asli.",
      price: 15000,
      category: "Minuman",
    },
    {
      name: "Kopi Hitam",
      description: "Kopi hitam tanpa gula, rasa pahit khas.",
      price: 12000,
      category: "Minuman",
    },
    {
      name: "Air Mineral",
      description: "Air mineral kemasan untuk menghilangkan dahaga.",
      price: 5000,
      category: "Minuman",
    },
    {
      name: "Es Kelapa Muda",
      description: "Minuman menyegarkan dari air dan daging kelapa muda.",
      price: 15000,
      category: "Minuman",
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
