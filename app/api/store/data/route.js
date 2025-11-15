import dbConnect from "@/lib/mongodb";
import Store from "@/lib/models/Store";
import Product from "@/lib/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    // Get store username from query params
    const searchParams = new URL(request.url).searchParams;
    const username = searchParams.get('username')?.toLowerCase();

    if (!username) {
      return NextResponse.json({ error: "missing username" }, { status: 400 });
    }

    // Get store info
    const store = await Store.findOne({
      username: username,
      isActive: true
    }).lean();

    if (!store) {
      return NextResponse.json({ error: "store not found" }, { status: 404 });
    }

    // Get products with ratings for this store
    const products = await Product.find({
      storeId: store._id.toString()
    })
    .populate('rating')
    .lean();

    // Add products to store object
    const storeWithProducts = {
      ...store,
      Product: products
    };

    return NextResponse.json({ store: storeWithProducts });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      error: error.code || error.message 
    }, { status: 500 });
  }
}
