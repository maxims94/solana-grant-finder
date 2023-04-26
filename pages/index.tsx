import Head from 'next/head'
import GrantsView from '../components/GrantsView'
import Airtable from 'airtable';

import { Grant } from '@/types/Grant';

export default function Home({ data }: { data: Grant[]}) {
  return (
    <>
      <Head>
        <title>Solana Grant Finder</title>
      </Head>
    <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
      <div>
        <h1>Solana Grant Finder</h1>
        <GrantsView data={data}/>
      </div>
    </>
  )
}

export async function getStaticProps() {
  
  console.log("Load Airtable data")
  
  if(
    !process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN ||
    !process.env.AIRTABLE_BASE_ID ||
    !process.env.AIRTABLE_GRANTS_TABLE_ID
  ) 
    throw new Error("Missing Airtable credentials")

  const base = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN as string}).base(process.env.AIRTABLE_BASE_ID as string);
  const table = base(process.env.AIRTABLE_GRANTS_TABLE_ID as string)
  
  let result;

  try {
    result = await table.select().all()
  } catch(error: any) {
    console.error("Couldn't retrieve Airtable data:", error)
    throw new Error(error)
  }

  console.log("Number of records: ", result.length)
  
  const data: Grant[] = []

  for(const record of result) {
    data.push({
      id: record.id,
      name: record.get('Name') as string,
      category: (record.get('Category') || []) as string[],
      rfp: Boolean(record.get('RFP'))
    })
  }
  
  console.log(data)
  
  return {
    props: { data: data }
  }
}