import { NextRequest, NextResponse } from "next/server";
export function middleware(request:NextRequest){if(!request.cookies.has("medisys_session"))return NextResponse.redirect(new URL("/login",request.url));return NextResponse.next()}
export const config={matcher:["/dashboard/:path*","/trocar-senha/:path*"]};
