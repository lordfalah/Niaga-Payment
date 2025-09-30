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
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { Category } from "@prisma/client";
import {
  createCategorySchema,
  TCreateCategoryInput,
} from "@/validation/category.schema";
import { isObjectLike } from "@/lib/utils";
import { updateCategoryAction } from "@/actions/category";

const EditCategory: React.FC<{ data: Category }> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<TCreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: data.name,
      description: data.description ?? "",
    },
  });

  const onSubmit = useCallback(
    (values: TCreateCategoryInput) => {
      toast.promise(
        (async () => {
          setIsSubmitting(true);
          try {
            const res = await updateCategoryAction(data.id, values);

            if (!res.status && res.errors && typeof isObjectLike(res.errors)) {
              Object.keys(res.errors).forEach((key) => {
                form.setError(key as keyof TCreateCategoryInput, {
                  type: "server",
                  message: res.errors[key as keyof TCreateCategoryInput],
                });
              });

              throw new Error(res.message || "Failed to create Category");
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
          loading: "Saving Category...",
          success: "Category berhasil diupdate!",
          error: (err) => getErrorMessage(err),
          position: "top-center",
        },
      );
    },
    [form, data.id],
  );

  return (
    <>
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
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sheet edit */}
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>
              Make changes to Category here. Click save when done.
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
                      <FormLabel>Name Category</FormLabel>
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
              </div>
              <SheetFooter className="self-end">
                <Button
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
    </>
  );
};

export default EditCategory;
