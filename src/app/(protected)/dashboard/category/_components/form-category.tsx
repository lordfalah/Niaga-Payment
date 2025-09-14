"use client";

import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
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

import {
  createCategorySchema,
  TCreateCategoryInput,
} from "@/validation/category.schema";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCategoryAction } from "@/actions/category";

const FormCategory: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<TCreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = useCallback(
    (data: TCreateCategoryInput) => {
      toast.promise(
        (async () => {
          setIsSubmitting(true);
          try {
            const res = await createCategoryAction(data);

            if (!res.status) {
              // cek kalau ada errors di dalam response
              if ("errors" in res) {
                Object.keys(res.errors).forEach((key) => {
                  form.setError(key as keyof TCreateCategoryInput, {
                    type: "server",
                    message:
                      (res.errors as Record<string, string>)[
                        key as keyof TCreateCategoryInput
                      ] ?? "",
                  });
                });
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
          loading: "Saving Category...",
          success: "Category berhasil disimpan!",
          error: (err) => getErrorMessage(err),
        },
      );
    },
    [form],
  );

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <Form {...form}>
        <form id="form-category" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogTrigger asChild>
            <Button variant="outline">Create</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Product</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
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
                  <FormItem className="grid gap-3">
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
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                form="form-category"
                type="submit"
                disabled={isSubmitting}
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
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
};

export default FormCategory;
