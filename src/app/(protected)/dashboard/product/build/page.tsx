import React from "react";
import CreateProduct from "./_components/create-product";

const BuildProduct: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <CreateProduct />
    </div>
  );
};

export default BuildProduct;
