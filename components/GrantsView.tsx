import { useState } from 'react';

export default function GrantsView({ data }: { data: GrantsTableEntry[] }) {

  return (
    <div>
    GrantsView
    {
      data.map(entry => <p key={entry.id}>{entry.name}</p>)
    }
    </div>
  )

}