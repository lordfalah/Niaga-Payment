"use client";

import React, { useCallback, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/handle-error";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductSchema,
  TCreateProductInput,
} from "@/validation/product.schema";
import { cn, isObjectLike } from "@/lib/utils";
import { NumericFormat } from "react-number-format";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { createProductAction } from "@/actions/product";
import { useForm } from "react-hook-form";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Category } from "@prisma/client";

const CreateProductSheet: React.FC<{ categorys: Category[] }> = ({
  categorys,
}) => {
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

            if (!res.status && res.errors && typeof isObjectLike(res.errors)) {
              Object.keys(res.errors).forEach((key) => {
                form.setError(key as keyof TCreateProductInput, {
                  type: "server",
                  message: res.errors[key as keyof TCreateProductInput],
                });
              });

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
          position: "top-center",
        },
      );
    },
    [form],
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size={"sm"}>
          Create Product
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Product</SheetTitle>
          <SheetDescription>
            Create the product details and save the changes
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            className="grid h-full content-between"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2.5">
                    <FormLabel>Name Product</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="makanan/minuman"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="space-y-2.5">
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
                  <FormItem className="space-y-2.5">
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

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="w-full space-y-2.5">
                    <FormLabel>Category</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? categorys.find(
                                  (category) => category.id === field.value,
                                )?.name
                              : "Select Category"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search Category..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {categorys.map((category) => (
                                <CommandItem
                                  value={category.id}
                                  key={category.id}
                                  onSelect={() => {
                                    form.setValue("category", category.id);
                                  }}
                                >
                                  {category.name}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      category.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="self-end">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <React.Fragment>
                    <Loader2 className="animate-spin" />
                    Please wait
                  </React.Fragment>
                ) : (
                  "Submit"
                )}
              </Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateProductSheet;
