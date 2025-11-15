import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Store from "@/lib/models/Store";
import ImageKit from "imagekit";

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Create the store
export async function POST(request) {
  try {
    await dbConnect();
    
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the data from the form
    const formData = await request.formData();

    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const image = formData.get("image");

    if (!name || !username || !description || !email || !contact || !address || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user has already registered a store
    const existingStore = await Store.findOne({ userId: userId });

    // If store already exists
    if (existingStore) {
      return NextResponse.json({ 
        status: existingStore.status,
        message: "You already have a store"
      });
    }

    // Check if username is already taken
    const isUsernameTaken = await Store.findOne({ 
      username: username.toLowerCase() 
    });

    if (isUsernameTaken) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    // Upload image to ImageKit
    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "logos"
    });

    // Generate optimized image URL
    const optimizedImage = imagekit.url({
      path: uploadResponse.filePath,
      transformation: [
        { quality: 'auto' },
        { format: 'webp' },
        { width: '512' },
      ]
    });

    // Create the store
    const newStore = await Store.create({
      userId: userId,
      name: name,
      username: username.toLowerCase(),
      description: description,
      email: email,
      contact: contact,
      address: address,
      logo: optimizedImage,
      status: 'pending',
      isActive: false
    });

    return NextResponse.json({ 
      success: true,
      message: "Applied! Waiting for approval.",
      store: {
        id: newStore._id,
        username: newStore.username,
        status: newStore.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json({ 
      error: error.code || error.message || "Internal server error" 
    }, { status: 400 });
  }
}

// Check if user has already registered a store
export async function GET(request) {
  try {
    await dbConnect();

    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has already registered a store
    const store = await Store.findOne({ userId: userId });

    // If store is already registered then send status of store
    if (store) {
      return NextResponse.json({ status: store.status }, { status: 200 });
    }

    return NextResponse.json({ status: "Not Registered" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      error: error.code || error.message 
    }, { status: 400 });
  }
}
