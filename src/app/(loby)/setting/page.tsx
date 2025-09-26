import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileDetailsForm } from "@/app/(protected)/dashboard/setting/_components/profile-detail-form";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_APP_URL}`),
  title: "Profile Settings",
  description:
    "Manage and update your account details, personal information, password, and communication preferences.",
};

const PageSetting: React.FC = async () => {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) redirect("/");
  return (
    <section className="container px-4 pt-28 pb-14 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Akun</CardTitle>
          <CardDescription>
            Perbarui detail profil Anda dan kelola pengaturan akun
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link href={"/"}>Loby</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <ProfileDetailsForm user={user} />
        </CardContent>
      </Card>
    </section>
  );
};

export default PageSetting;
