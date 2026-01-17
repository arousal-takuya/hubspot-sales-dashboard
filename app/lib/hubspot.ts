const HUBSPOT_API_BASE = 'https://api.hubapi.com';
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    dealstage: string;
    amount?: string;
    closedate?: string;
    pipeline: string;
    hs_deal_stage_probability?: string;
    days_to_close?: string;
    hubspot_owner_id?: string;
    createdate: string;
    hs_lastmodifieddate: string;
    hs_projected_amount?: string;
    [key: string]: any;
  };
}

export async function getAllDeals(limit: number = 100): Promise<HubSpotDeal[]> {
  try {
    const properties = [
      'dealname',
      'dealstage',
      'amount',
      'closedate',
      'pipeline',
      'hs_deal_stage_probability',
      'days_to_close',
      'hubspot_owner_id',
      'createdate',
      'hs_lastmodifieddate',
      'hs_projected_amount',
      'hs_is_closed',
      'hs_is_closed_won',
      'hs_is_closed_lost',
    ];

    let allDeals: HubSpotDeal[] = [];
    let after: string | undefined = undefined;
    let hasMore = true;

    // ページネーションで全てのDealを取得
    while (hasMore) {
      const url: string = `${HUBSPOT_API_BASE}/crm/v3/objects/deals?limit=${limit}&properties=${properties.join(',')}${after ? `&after=${after}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const deals = data.results.map((deal: any) => ({
        id: deal.id,
        properties: deal.properties,
      }));

      allDeals = [...allDeals, ...deals];

      // 次のページがあるかチェック
      if (data.paging && data.paging.next && data.paging.next.after) {
        after = data.paging.next.after;
      } else {
        hasMore = false;
      }

      console.log(`Fetched ${deals.length} deals. Total so far: ${allDeals.length}`);
    }

    console.log(`Total deals fetched: ${allDeals.length}`);
    return allDeals;
  } catch (error) {
    console.error('Error fetching deals from HubSpot:', error);
    throw error;
  }
}

export async function getOpenDeals(): Promise<HubSpotDeal[]> {
  try {
    const allDeals = await getAllDeals();
    // Return all deals (filtering logic can be added later if needed)
    // For now, we want to show all available deals
    return allDeals;
  } catch (error) {
    console.error('Error fetching open deals:', error);
    throw error;
  }
}

export async function getPipelineStages(pipelineId: string = 'default') {
  try {
    const url = `${HUBSPOT_API_BASE}/crm/v3/pipelines/deals/${pipelineId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.stages;
  } catch (error) {
    console.error('Error fetching pipeline stages:', error);
    throw error;
  }
}
