import { format } from 'date-fns';

import prismadb from '@/lib/prismadb';
import { ProductClient } from './components/client';
import { ProductColumn } from './components/columns';

const ProductsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  const products = await prismadb.product.findMany({
    where: { storeId: storeId },
    include:{
      category:true,
      size:true,
      color:true
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isArchived: item.isArchived,
    isFeatured: item.isFeatured,
    price: item.price.toString(),
    category: item.category?.name || 'No category',
    size: item.size?.name || 'No size',
    color: item.color?.name || 'No color',
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <ProductClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;