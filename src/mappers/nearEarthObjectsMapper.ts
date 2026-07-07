export type NearEarthObjectFeed = {
  elementCount: number;
  objects: NearEarthObject[];
};

export type NearEarthObject = {
  id?: string;
  name?: string;
  isPotentiallyHazardousAsteroid?: boolean;
  estimatedDiameterMinKm?: number;
  estimatedDiameterMaxKm?: number;
  closeApproachDate?: string;
  relativeVelocityKph?: string;
  missDistanceKm?: string;
};

export function mapNearEarthObjectFeed(response: any): NearEarthObjectFeed {
  const groupedObjects = response?.near_earth_objects ?? {};
  const objects = Object.values(groupedObjects)
    .flatMap(value => Array.isArray(value) ? value : [])
    .map((neo: any): NearEarthObject => {
      const approach = neo?.close_approach_data?.[0];

      return {
        id: neo?.id,
        name: neo?.name,
        isPotentiallyHazardousAsteroid: neo?.is_potentially_hazardous_asteroid,
        estimatedDiameterMinKm: neo?.estimated_diameter?.kilometers?.estimated_diameter_min,
        estimatedDiameterMaxKm: neo?.estimated_diameter?.kilometers?.estimated_diameter_max,
        closeApproachDate: approach?.close_approach_date,
        relativeVelocityKph: approach?.relative_velocity?.kilometers_per_hour,
        missDistanceKm: approach?.miss_distance?.kilometers,
      };
    });

  return {
    elementCount: response?.element_count ?? objects.length,
    objects,
  };
}
