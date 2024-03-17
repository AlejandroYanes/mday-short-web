/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */
'use client'

export default function Monday() {

  return (
    <div className="App">
      <div className="bg-emerald-700/10 p-4 rounded">
        <h2 className="text-2xl font-bold mb-4">Monday.com context</h2>
        <pre>{JSON.stringify({}, undefined, 2)}</pre>
      </div>
      <div className="bg-emerald-700/10 p-4 rounded mt-6">
        <h2 className="text-2xl font-bold mb-4">Monday.com settings</h2>
        <pre>{JSON.stringify({}, undefined, 2)}</pre>
      </div>
    </div>
  );
}
