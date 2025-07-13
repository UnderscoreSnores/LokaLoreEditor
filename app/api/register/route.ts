import { NextResponse } from "next/server";
import { registerSchema } from "../../components/RegisterForm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // TODO: Implement your actual registration logic here
    // This is just a placeholder for now
    return NextResponse.json({
      success: true,
      message: "Registration successful! Please continue with Discord login",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
