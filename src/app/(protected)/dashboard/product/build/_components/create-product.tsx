"use client";

import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/handle-error";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductSchema,
  TCreateProductInput,
} from "@/validation/product.schema";
import { cn } from "@/lib/utils";
import { NumericFormat } from "react-number-format";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Loader2 } from "lucide-react";
import { createProductAction } from "@/actions/product";

const CreateProduct: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<TCreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      price: 1000,
      description: "",
    },
  });

  const onSubmit = useCallback(
    (data: TCreateProductInput) => {
      toast.promise(
        (async () => {
          setIsSubmitting(true);
          try {
            const res = await createProductAction(data);

            if (!res.status) {
              // cek kalau ada errors di dalam response
              if ("errors" in res) {
                if (
                  typeof res.errors === "object" &&
                  !Array.isArray(res.errors)
                ) {
                  Object.keys(res.errors).forEach((key) => {
                    form.setError(key as keyof TCreateProductInput, {
                      type: "server",
                      message:
                        (res.errors as Record<string, string>)[
                          key as keyof TCreateProductInput
                        ] ?? "",
                    });
                  });
                }
              }

              throw new Error(res.message || "Failed to create product");
            }

            // sukses → reset form
            form.reset();
          } catch (error) {
            console.error({ error });
            throw error;
          } finally {
            setIsSubmitting(false);
          }
        })(),
        {
          loading: "Saving produk...",
          success: "Produk berhasil disimpan!",
          error: (err) => getErrorMessage(err),
        },
      );
    },
    [form],
  );

  return (
    <Card className="mx-auto w-full p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto grid max-w-md grid-cols-12 gap-x-3 gap-y-3.5"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-12 space-y-2.5 lg:col-span-6">
                <FormLabel>Name Product</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="makanan/minuman" type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="col-span-12 space-y-2.5 lg:col-span-6">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <div className="relative z-10 h-fit after:absolute after:top-1/2 after:z-20 after:-translate-y-1/2 after:pl-2 after:text-sm after:content-['Rp.']">
                    <NumericFormat
                      autoComplete="off"
                      value={field.value}
                      onValueChange={(values) => {
                        form.setValue("price", Number(values.value), {
                          shouldValidate: true,
                        });
                      }}
                      thousandSeparator="."
                      decimalSeparator=","
                      allowNegative={false}
                      allowLeadingZeros={false}
                      placeholder="10.000"
                      className={cn(
                        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pl-8 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-12 space-y-2.5">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <AutosizeTextarea
                    placeholder="This textarea with min height 52 and max height 200."
                    maxHeight={200}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="col-span-12 space-y-2.5 md:col-span-6">
                <FormLabel>Category</FormLabel>

                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categorys.length > 0
                      ? categorys.map(({ name, id }) => (
                          <SelectItem value={id} key={id}>
                            {name}
                          </SelectItem>
                        ))
                      : "Category doesnt exsist"}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {/* <FormField
            control={form.control}
            name="isVisible"
            render={({ field }) => (
              <FormItem className="col-span-12 flex flex-row items-center justify-between space-y-2.5 rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Is visible</FormLabel>
                  <FormDescription>Enable flag to show user</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    disabled={isSubmitting}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          /> */}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="col-span-12 mt-2.5"
          >
            {isSubmitting ? (
              <React.Fragment>
                <Loader2 className="animate-spin" />
                Please wait
              </React.Fragment>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default CreateProduct;
