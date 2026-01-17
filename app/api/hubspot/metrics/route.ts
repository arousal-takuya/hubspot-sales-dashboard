import { NextResponse } from 'next/server';
import { getOpenDeals, getPipelineStages } from '@/app/lib/hubspot';
import { calculateMetrics, calculatePipelineFunnel } from '@/app/lib/analytics';

export async function GET() {
  try {
    const deals = await getOpenDeals();
    const stages = await getPipelineStages();

    const metrics = calculateMetrics(deals);
    const funnelData = calculatePipelineFunnel(deals, stages);

    return NextResponse.json({
      metrics,
      funnelData,
      dealsCount: deals.length,
    });
  } catch (error) {
    console.error('Error in /api/hubspot/metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
