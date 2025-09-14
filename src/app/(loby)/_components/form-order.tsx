"use client";

import React, { Fragment, useCallback, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Loader2, Trash2, Plus } from "lucide-react";
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
import { Product } from "@/generated/prisma";
import { User } from "better-auth";
import { Badge } from "@/components/ui/badge";
import { createOrderAction } from "@/actions/order";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-error";

export default function OrderForm({
  products,
  user,
}: {
  products: Array<Pick<Product, "id" | "name" | "price">>;
  user: User;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<TCreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
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

  const items = form.watch("items");

  // Hitung subtotal per item dan total semua
  const subtotals = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return (product?.price || 0) * (item.quantity || 0);
  });

  // Hitung total secara langsung dari items
  const total = subtotals.reduce((acc, cur) => acc + cur, 0);

  const onSubmit = useCallback(
    (data: TCreateOrderInput) => {
      toast.promise(
        (async () => {
          setIsSubmitting(true);
          try {
            const res = await createOrderAction(data, user.id);

            if (!res.status) {
              // cek kalau ada errors di dalam response
              if ("errors" in res) {
                Object.keys(res.errors).forEach((key) => {
                  form.setError(key as keyof TCreateOrderInput, {
                    type: "server",
                    message:
                      (res.errors as Record<string, string>)[
                        key as keyof TCreateOrderInput
                      ] ?? "",
                  });
                });
              }

              throw new Error(res.message || "Failed to create order");
            }

            form.reset();
          } catch (error) {
            console.error({ error });
            throw error;
          } finally {
            setIsSubmitting(false);
          }
        })(),
        {
          loading: "Saving Order...",
          success: "Order berhasil disimpan!",
          error: (err) => getErrorMessage(err),
        },
      );
    },
    [form, user.id],
  );

  return (
    <CardContent className="px-4 sm:px-6">
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

          <Card className="space-y-4 p-4">
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
                  <div className="flex flex-wrap items-center justify-between gap-x-2.5">
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
                            <SelectContent>
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
                                let newValue = Number(rawValue);

                                // Jika nilai kosong atau 0, langsung set menjadi 1
                                if (rawValue === "" || newValue < 1) {
                                  newValue = 1;
                                } else if (newValue >= 100) {
                                  newValue = 99;
                                }

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
