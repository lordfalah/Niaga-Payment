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
import { deleteProducts, updateProductAction } from "@/actions/product";
import { useForm } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { Category, Product } from "@/generated/prisma";
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

const EditProduct: React.FC<{
  data: Product & { category: Category | null };
  categorys: Category[];
}> = ({ data, categorys }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<TCreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: data.name,
      price: data.price,
      description: data.description ?? "",
      category: data.category?.id,
    },
  });

  const onSubmit = useCallback(
    (values: TCreateProductInput) => {
      toast.promise(
        (async () => {
          setIsSubmitting(true);
          try {
            const res = await updateProductAction(data.id, values);

            if (!res.status && res.errors && typeof isObjectLike(res.errors)) {
              Object.keys(res.errors).forEach((key) => {
                form.setError(key as keyof TCreateProductInput, {
                  type: "server",
                  message: res.errors[key as keyof TCreateProductInput],
                });
              });

              throw new Error(res.message || "Failed to create product");
            }
            setOpen(false);
          } catch (error) {
            console.error({ error });
            throw error;
          } finally {
            setIsSubmitting(false);
          }
        })(),
        {
          loading: "Saving produk...",
          success: "Produk berhasil diupdate!",
          error: (err) => getErrorMessage(err),
          position: "top-center",
        },
      );
    },
    [form, data.id],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Dropdown menu di table */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              toast.promise(
                deleteProducts({
                  ids: [data.id],
                }),
                {
                  loading: "Loading...",
                  success: "Product deleted",
                  error: (err) => getErrorMessage(err),
                  position: "top-center",
                },
              );
            }}
            variant="destructive"
          >
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sheet edit */}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit product</SheetTitle>
          <SheetDescription>
            Make changes to product here. Click save when done.
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
                  <FormItem className="col-span-12 space-y-2.5">
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
                  <FormItem className="col-span-12 space-y-2.5">
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

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="col-span-12 space-y-2.5">
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

export default EditProduct;
