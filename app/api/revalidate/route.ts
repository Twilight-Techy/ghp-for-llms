import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');

  if (!path) {
    return NextResponse.json({ message: 'Missing path param' }, { status: 400 });
  }

  try {
    // Revalidate the provided path (e.g., /facebook/react)
    // We use type 'layout' to revalidate the whole tree of that path if needed, 
    // or just 'page'. For now 'page' is default, which revalidates that exact URL.
    revalidatePath(path, 'layout');
    
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
