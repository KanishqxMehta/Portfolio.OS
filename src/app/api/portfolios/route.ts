import { prisma } from "@/lib/prisma";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = portfolioSchema.parse(json);

    const portfolio = await prisma.portfolio.upsert({
      where: {
        publicSlug: body.username,
      },
      update: {
        content: body.content as any,
      },
      create: {
        publicSlug: body.username,
        content: body.content as any,
        userId: "1234",
      },
    });

    return NextResponse.json(portfolio, { status: 200 });
  } catch (error: any) {
    console.error("PRISMA_7_POST_ERROR:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}