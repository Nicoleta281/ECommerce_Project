import prismadb from "@/lib/prismadb";
import { CategoryForm } from "../[categoryId]/components/category-form";

const NewCategoryPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm initialData={null} billboards={billboards} />
      </div>
    </div>
  );
};

export default NewCategoryPage;
