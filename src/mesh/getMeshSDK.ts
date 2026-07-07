type NeoFeedArgs = {
  start_date: string;
  end_date: string;
  api_key: string;
};

type MeshSDK = {
  neoFeed(args: NeoFeedArgs): Promise<any>;
};

let injectedSdk: MeshSDK | null = null;

export function setMeshSDKForTests(sdk: MeshSDK | null) {
  injectedSdk = sdk;
}

export async function getMeshSDK(): Promise<MeshSDK> {
  if (injectedSdk) {
    return injectedSdk;
  }

  try {
    const generated = await new Function('path', 'return import(path)')('../../.mesh/index.js');
    const builtMesh = await generated.getBuiltMesh();
    const sdk = generated.getMeshSDK(builtMesh);
    return sdk;
  } catch {
    return {
      async neoFeed(args: NeoFeedArgs) {
        const url = new URL('https://api.nasa.gov/neo/rest/v1/feed');
        url.searchParams.set('start_date', args.start_date);
        url.searchParams.set('end_date', args.end_date);
        url.searchParams.set('api_key', args.api_key);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`NASA NEO request failed with status ${response.status}`);
        }

        return response.json();
      },
    };
  }
}
