import dbConnect from "@/lib/mongodb";
import Store from "@/lib/models/Store";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Auth Seller
export async function GET(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);
    
    // Check if the user is authenticated (userId exists)
    if (!userId) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }

    // Check if the authenticated user is a seller
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ error: 'not authorized' }, {
        status: 401
      });
    }

    const storeInfo = await Store.findOne({ userId: userId });

    return NextResponse.json({ isSeller, storeInfo });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
