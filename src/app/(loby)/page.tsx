import { getServerSession } from "@/lib/get-session";
import OrderForm from "./_components/form-order";
import { getProducts } from "@/actions/product";
import CardLoby from "./_components/card-loby";
import { TRole } from "@/generated/prisma";
import OrderFormSkeleton from "./_components/form-order-skeleton";

export default async function Home() {
  const [session, { data }] = await Promise.all([
    getServerSession(),
    getProducts(),
  ]);

  // Case 1: Pengguna belum login
  if (!session) {
    return (
      <CardLoby
        title="Akses Ditolak"
        subTitle="Anda tidak berwenang"
        description="Silakan masuk untuk melanjutkan."
      >
        <OrderFormSkeleton />
      </CardLoby>
    );
  }

  // Case 2: Pengguna sudah login tetapi memiliki peran 'USER' (tidak diizinkan membuat order)
  if (session.user.role === TRole.USER) {
    return (
      <CardLoby
        title="Akses Ditolak"
        subTitle="Anda tidak memiliki wewenang untuk membuat order."
        description="Akses untuk membuat order hanya tersedia untuk peran tertentu. Silakan hubungi administrator Anda."
      >
        <OrderFormSkeleton />
      </CardLoby>
    );
  }

  // Case 3: Pengguna sudah login dengan peran yang diizinkan
  return (
    <CardLoby
      title="Niaga Order"
      subTitle={`Buat Order oleh ${session.user.name}`}
      description="Silakan isi formulir di bawah ini untuk membuat order baru."
    >
      <OrderForm products={data} user={session.user} />
    </CardLoby>
  );
}
