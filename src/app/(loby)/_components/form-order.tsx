"use client";

import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Trash2, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createOrderSchema,
  TCreateOrderInput,
} from "@/validation/order.schema";
import { Product, TPayment, TStatusOrder } from "@/generated/prisma";
import { User } from "better-auth";
import { Badge } from "@/components/ui/badge";
import { createOrderAction, updateOrderStatus } from "@/actions/order";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/handle-error";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { isObjectLike } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const paymentMethods = [
  {
    name: TPayment.CASH,
    description: "Bayar CASH",
  },
  {
    name: TPayment.QRIS,
    description: "Bayar QRIS",
  },
] as const;

export default function OrderForm({
  products,
  user,
}: {
  products: Array<Pick<Product, "id" | "name" | "price">>;
  user: User;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 menit = 300 detik
  const [qrisData, setQrisData] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const form = useForm<TCreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      payment: TPayment.CASH,
      status: TStatusOrder.PENDING,
      customerName: "",
      createdById: user.id,
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const {
    fields: itemFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (!dialogOpen) return;
    setCountdown(300);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDialogOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [dialogOpen]);

  const items = form.watch("items");

  // Hitung subtotal per item dan total semua
  const subtotals = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return (product?.price || 0) * (item.quantity || 0);
  });

  // Hitung total secara langsung dari items
  const total = subtotals.reduce((acc, cur) => acc + cur, 0);

  const onSubmit = useCallback(
    async (data: TCreateOrderInput) => {
      const toastId = toast.loading("Loading...", { position: "top-center" });
      setIsSubmitting(true);
      try {
        const res = await createOrderAction(data);

        // Error validasi server
        if (!res.status && res.errors && typeof isObjectLike(res.errors)) {
          Object.keys(res.errors).forEach((key) => {
            form.setError(key as keyof TCreateOrderInput, {
              type: "server",
              message: res.errors[key],
            });
          });
          throw new Error(res.message);
        }

        if (res.status && data.payment === TPayment.QRIS) {
          // success
          // cek dulu apakah ada data & qrisData
          const qris = res.data?.qrisData;
          const orderId = res.data.id;
          if (!qris || !orderId)
            throw new Error("Data order tidak lengkap dari server");

          setQrisData(qris);
          setOrderId(orderId);
          setDialogOpen(true);
        } else {
          form.reset();
          toast.success("Order Cash berhasil dibuat", {
            position: "top-center",
          });
        }
      } catch (err) {
        showErrorToast(err);
      } finally {
        toast.dismiss(toastId);
        setIsSubmitting(false);
      }
    },
    [form],
  );

  const onUpdateStatus = async (statusOrder: TStatusOrder) => {
    if (!orderId) {
      showErrorToast("Order ID tidak ditemukan");
      return;
    }
    const { data, status, error } = await updateOrderStatus(
      orderId,
      statusOrder,
    );

    if (status) {
      toast.success(data, {
        position: "top-center",
      });
    } else {
      showErrorToast(error);
    }

    form.reset();
  };

  return (
    <CardContent className="px-4 sm:px-6">
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-sm">
          <AlertDialogHeader>
            <div className="flex items-center justify-between">
              <AlertDialogTitle>Konfirmasi Pembayaran</AlertDialogTitle>

              <AlertDialogCancel asChild>
                <Button type="button" variant={"destructive"}>
                  <X />
                </Button>
              </AlertDialogCancel>
            </div>
            <AlertDialogDescription>
              Silakan scan QR berikut untuk melakukan pembayaran. Waktu tersisa:{" "}
              <span className="font-semibold">
                {Math.floor(countdown / 60)}:
                {String(countdown % 60).padStart(2, "0")}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-center py-4">
            {qrisData ? (
              <Image
                width={250}
                height={250}
                src={qrisData}
                alt="QRIS"
                className="h-48 w-48"
                priority
              />
            ) : (
              <Skeleton className="flex size-48 items-center justify-between">
                <p>Memuat QR...</p>
              </Skeleton>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={async () => await onUpdateStatus(TStatusOrder.CANCELLED)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => await onUpdateStatus(TStatusOrder.PAID)}
            >
              Bayar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Form {...form}>
        <form
          id="form-order"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <Card className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Customer</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukkan nama pelanggan"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Daftar Item</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: "", quantity: 1 })}
                disabled={items.length >= products.length}
                className={
                  items.length >= products.length
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }
              >
                <Plus className="mr-1 h-4 w-4" /> Tambah Item
              </Button>
            </div>

            {itemFields.map((field, index) => {
              const selectedProduct = products.find(
                (p) => p.id === items[index]?.productId,
              );

              // Hitung subtotal untuk item ini
              const subtotal =
                (selectedProduct?.price || 0) * (items[index]?.quantity || 0);

              return (
                <div
                  key={field.id}
                  className="space-y-3.5 rounded-md border p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-2">
                    {selectedProduct && subtotal && (
                      <Fragment>
                        <Badge variant="secondary" className="w-fit">
                          Harga: Rp{" "}
                          {selectedProduct.price.toLocaleString("id-ID")}
                        </Badge>

                        <Badge variant="secondary" className="w-fit">
                          SubTotal: Rp {subtotal.toLocaleString("id-ID")}
                        </Badge>
                      </Fragment>
                    )}
                  </div>

                  <div className="grid grid-cols-12 items-end gap-x-3.5">
                    {/* Select Produk */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem className="col-span-7">
                          <FormLabel className="ml-1">Produk</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full truncate">
                                <SelectValue placeholder="Pilih produk" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {products
                                .filter(
                                  (p) =>
                                    !items.some(
                                      (item, i) =>
                                        i !== index && item.productId === p.id,
                                    ),
                                )
                                .map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormLabel className="ml-1">Qty</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => {
                                const rawValue = e.target.value;

                                // Jika nilai input kosong, set ke string kosong untuk menghindari warning
                                if (rawValue === "") {
                                  field.onChange("");
                                  return;
                                }

                                const parsedValue = parseInt(rawValue, 10);

                                // Cek jika nilai yang di-parse adalah NaN atau tidak.
                                if (isNaN(parsedValue)) {
                                  field.onChange("");
                                  return;
                                }

                                // Terapkan aturan validasi (min 1, max 99)
                                const newValue = Math.max(
                                  1,
                                  Math.min(99, parsedValue),
                                );

                                // Perbarui field dengan nilai yang sudah divalidasi
                                field.onChange(newValue);
                              }}
                              // Memastikan nilai yang ditampilkan adalah number
                              value={field.value}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Remove button */}
                    <div className="col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={itemFields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            <FormField
              control={form.control}
              name="payment"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <fieldset className="flex flex-col gap-1.5">
                    <FormLabel className="ml-1 text-sm font-medium">
                      Pembayaran
                    </FormLabel>
                    <RadioGroup
                      className="flex flex-wrap gap-3 sm:flex-nowrap"
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      {paymentMethods.map(({ description, name }, idx) => (
                        <FormItem
                          key={idx}
                          className="has-[[data-state=checked]]:border-ring flex w-full items-start gap-3 rounded-lg border has-[[data-state=checked]]:bg-white has-[[data-state=checked]]:text-black dark:has-[[data-state=checked]]:bg-black dark:has-[[data-state=checked]]:text-white"
                        >
                          <FormLabel
                            htmlFor={name}
                            className="flex flex-grow cursor-pointer items-center gap-3 p-3"
                          >
                            <FormControl>
                              <RadioGroupItem
                                value={name}
                                id={name}
                                className="data-[state=checked]:border-primary bg-slate-400 dark:bg-auto"
                              />
                            </FormControl>
                            <div className="grid gap-1 font-normal">
                              <div className="font-medium">{name}</div>
                              <div className="text-muted-foreground pr-2 text-xs leading-snug text-balance">
                                {description}
                              </div>
                            </div>
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </fieldset>

                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <div className="bg-accent-foreground/10 dark:bg-muted rounded-lg p-3.5">
            <div className="flex items-center justify-between font-medium">
              <p>Total Bayar: </p>
              <p>Rp{total.toLocaleString("id-ID")}</p>
            </div>
          </div>
          <CardFooter className="px-0">
            <Button
              form="form-order"
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <React.Fragment>
                  <Loader2 className="animate-spin" />
                  Please wait
                </React.Fragment>
              ) : (
                "Buat Order"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </CardContent>
  );
}
