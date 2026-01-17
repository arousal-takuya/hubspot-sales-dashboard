import { NextResponse } from 'next/server';
import { getAllDeals, getOpenDeals } from '@/app/lib/hubspot';

export async function GET() {
  try {
    console.log('Fetching all deals...');
    const allDeals = await getAllDeals();
    console.log('Total deals fetched:', allDeals.length);

    const deals = await getOpenDeals();
    console.log('Open deals filtered:', deals.length);

    return NextResponse.json({ deals, total: allDeals.length });
  } catch (error) {
    console.error('Error in /api/hubspot/deals:', error);
    console.error('Error details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
