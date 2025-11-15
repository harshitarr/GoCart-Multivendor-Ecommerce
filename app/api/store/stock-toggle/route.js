import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";

// toggle stock of a product
export async function POST(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "missing details: productId" }, {
        status: 400
      });
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    // Check if the product exists and belongs to this store
    const product = await Product.findOne({
      _id: productId,
      storeId: storeId
    });

    if (!product) {
      return NextResponse.json({ error: "product not found" }, {
        status: 404
      });
    }

    // Toggle stock - modify and save
    product.inStock = !product.inStock;
    await product.save();

    return NextResponse.json({ 
      message: "Product stock status toggled successfully",
      inStock: product.inStock
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      error: error.code || error.message 
    }, { status: 400 });
  }
}
