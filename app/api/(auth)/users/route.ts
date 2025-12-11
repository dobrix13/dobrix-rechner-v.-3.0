import { NextResponse } from "next/server";
import connect from "@/lib/db";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";

const ObjectId = Types.ObjectId;

export const GET = async () => {
  try {
    await connect();
    const users = await User.find();
    return new NextResponse(JSON.stringify(users), {status: 200});
  } catch (error: any) {
    return new NextResponse("Kluda fetchojot userus" + error.message, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    // If login request
    if (body.action === "login") {
      await connect();
      const { name, password } = body;
      const user = await User.findOne({ name }).select("+password");
      if (!user) {
        return new NextResponse(JSON.stringify({ error: "Lietotājs nav atrasts" }), { status: 401 });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return new NextResponse(JSON.stringify({ error: "Nederīga parole" }), { status: 401 });
      }
      // Return organizationId and restaurantId as well
      return new NextResponse(JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        restaurantId: user.restaurantId,
        _id: user._id,
      }), { status: 200 });
    }

    // Otherwise, treat as user creation
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const restaurantId = searchParams.get("restaurantId");

    // Prepare user data based on role
    let userData = { ...body };

    if (body.role === "kellner" || body.role === "manager") {
      if (!organizationId || !restaurantId) {
        return new NextResponse(
          "organizationId und restaurantId müssen gesetzt sein",
          { status: 400 }
        );
      }
      userData.organizationId = organizationId;
      userData.restaurantId = restaurantId;
    } else if (body.role === "org_admin") {
      if (!organizationId) {
        return new NextResponse(
          "organizationId muss gesetzt sein",
          { status: 400 }
        );
      }
      userData.organizationId = organizationId;
      userData.restaurantId = undefined;
    }

    await connect();
    const newUser = new User(userData);
    await newUser.save();
    return new NextResponse(JSON.stringify(newUser), { status: 201 });
  } catch (error: any) {
    return new NextResponse("Kļūda, izveidojot lietotāju: " + error.message, { status: 500 });
  }
};

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return new NextResponse("User _id is required for update", { status: 400 });
    }

    // Hash password if it's being updated
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    await connect();
    const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true });
    if (!updatedUser) {
      return new NextResponse("User not found", { status: 404 });
    }
    return new NextResponse(JSON.stringify(updatedUser), { status: 200 });
  } catch (error: any) {
    return new NextResponse("Kļūda, atjauninot lietotāju: " + error.message, { status: 500 });
  }
};

export const DELETE = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return new NextResponse("User id is required for deletion", { status: 400 });
    }

    await connect();
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return new NextResponse("User not found", { status: 404 });
    }
    return new NextResponse(JSON.stringify({ message: "User deleted", _id: userId }), { status: 200 });
  } catch (error: any) {
    return new NextResponse("Kļūda, dzēšot lietotāju: " + error.message, { status: 500 });
  }
};